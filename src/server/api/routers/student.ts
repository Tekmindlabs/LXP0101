import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status, UserType } from "@prisma/client";
import { generatePassword } from "../../../utils/password";

export const studentRouter = createTRPCRouter({
	createStudent: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string().email(),
			dateOfBirth: z.date(),
			classId: z.string(),
			parentName: z.string().optional(),
			parentEmail: z.string().email().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			try {
				// Check if student email exists
				const existingStudent = await ctx.prisma.user.findUnique({
					where: { email: input.email }
				});
				if (existingStudent) {
					throw new Error("Email already exists");
				}

				// Check if parent email exists if provided
				if (input.parentEmail) {
					const existingParent = await ctx.prisma.user.findUnique({
						where: { email: input.parentEmail }
					});
					if (existingParent) {
						throw new Error("Parent email already exists");
					}
				}

				const studentPassword = generatePassword();
				let parentData = null;
				
				// Create parent if parent info is provided
				if (input.parentName && input.parentEmail) {
					try {
						const parentPassword = generatePassword();
						const parent = await ctx.prisma.user.create({
							data: {
								name: input.parentName,
								email: input.parentEmail,
								password: parentPassword,
								userType: "PARENT",
								status: "ACTIVE",
								parentProfile: {
									create: {},
								},
								userRoles: {
									create: {
										role: {
											connectOrCreate: {
												where: { name: "PARENT" },
												create: { name: "PARENT" }
											}
										}
									}
								}
							},
							include: {
								parentProfile: true,
								userRoles: {
									include: {
										role: true
									}
								}
							},
						});
						
						parentData = {
							...parent,
							credentials: parentPassword
						};
					} catch (error) {
						if (error instanceof Error) {
							throw new Error(`Failed to create parent: ${error.message}`);
						}
						throw new Error("Failed to create parent");
					}
				}

				// Create student
				try {
					const student = await ctx.prisma.user.create({
						data: {
							name: input.name,
							email: input.email,
							password: studentPassword,
							userType: "STUDENT",
							status: "ACTIVE",
							studentProfile: {
								create: {
									dateOfBirth: input.dateOfBirth,
									classId: input.classId,
									...(parentData?.parentProfile && { parentId: parentData.parentProfile.id }),
								},
							},
							userRoles: {
								create: {
									role: {
										connectOrCreate: {
											where: { name: "STUDENT" },
											create: { name: "STUDENT" }
										}
									}
								}
							}
						},
						include: {
							studentProfile: true,
							userRoles: {
								include: {
									role: true
								}
							}
						},
					});

					return {
						...student,
						studentProfile: {
							...student.studentProfile,
							credentials: studentPassword,
						},
						userRoles: student.userRoles,
						parentProfile: parentData ? {
							...parentData.parentProfile,
							credentials: parentData.credentials,
							userRoles: parentData.userRoles
						} : null
					};
				} catch (error) {
					if (error instanceof Error) {
						throw new Error(`Failed to create student: ${error.message}`);
					}
					throw new Error("Failed to create student");
				}
			} catch (error) {
				if (error instanceof Error) {
					throw new Error(error.message);
				}
				throw new Error("Failed to create student");
			}
		}),

	list: protectedProcedure
		.input(z.object({
			classId: z.string()
		}))
		.query(async ({ ctx, input }) => {
			return ctx.prisma.studentProfile.findMany({
				where: {
					classId: input.classId
				},
				include: {
					user: true
				}
			});
		}),

	updateStudent: protectedProcedure
		.input(z.object({
			id: z.string(),
			name: z.string().optional(),
			email: z.string().email().optional(),
			dateOfBirth: z.date().optional(),
			classId: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const student = await ctx.prisma.user.update({
				where: { id: input.id },
				data: {
					name: input.name,
					email: input.email,
					studentProfile: {
						update: {
							dateOfBirth: input.dateOfBirth,
							classId: input.classId,
						},
					},
				},
				include: {
					studentProfile: true,
				},
			});
			return student;
		}),



	deleteStudent: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.user.delete({
				where: { id: input },
			});
		}),

	getStudent: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			return ctx.prisma.user.findUnique({
				where: { id: input },
				include: {
					studentProfile: {
						include: {
							class: {
								include: {
									classGroup: {
										include: {
											program: true,
										},
									},
								},
							},
							parent: {
								include: {
									user: true,
								},
							},
							activities: {
								include: {
									activity: true,
								},
							},
							attendance: true,
						},
					},
				},
			});
		}),

	searchStudents: protectedProcedure
		.input(z.object({
			search: z.string().optional(),
			classId: z.string().optional(),
			programId: z.string().optional(),
			status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]).optional(),
		}))
		.query(async ({ ctx, input }) => {
			const { search, classId, programId, status } = input;

			return ctx.prisma.user.findMany({
				where: {
					userType: UserType.STUDENT,
					...(search && {
						OR: [
							{ name: { contains: search, mode: 'insensitive' } },
							{ email: { contains: search, mode: 'insensitive' } },
						],
					}),
					studentProfile: {
						...(classId && { classId }),
						...(programId && {
							class: {
								classGroup: {
									programId,
								},
							},
						}),
					},
					...(status && { status }),
				},
				include: {
					studentProfile: {
						include: {
							class: {
								include: {
									classGroup: {
										include: {
											program: true,
										},
									},
								},
							},
							parent: {
								include: {
									user: true,
								},
							},
							activities: {
								include: {
									activity: true,
								},
							},
							attendance: true,
						},
					},
				},
				orderBy: {
					name: 'asc',
				},
			});
		}),

	assignToClass: protectedProcedure
		.input(z.object({
			studentId: z.string(),
			classId: z.string()
		}))
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.studentProfile.update({
				where: { userId: input.studentId },
				data: { classId: input.classId },
				include: {
					class: {
						include: {
							classGroup: {
								include: {
									program: true,
								},
							},
						},
					},
				},
			});
		}),

	getStudentProfile: protectedProcedure
		.input(z.object({
			id: z.string(),
		}))
		.query(async ({ ctx, input }) => {
			const student = await ctx.prisma.user.findUnique({
				where: { id: input.id },
				include: {
					studentProfile: {
						include: {
							class: {
								include: {
									classGroup: {
										include: {
											program: true,
										},
									},
								},
							},
							parent: {
								include: {
									user: true,
								},
							},
							activities: {
								include: {
									activity: true,
								},
							},
							attendance: true,
						},
					},
				},
			});

			if (!student || !student.studentProfile) {
				throw new Error("Student profile not found");
			}

			return student;
		}),

	getStudentPerformance: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const student = await ctx.prisma.studentProfile.findUnique({
				where: { userId: input },
				include: {
					activities: {
						include: {
							activity: true,
						},
					},
					attendance: true,
					class: {
						include: {
							classGroup: {
								include: {
									subjects: true,
								},
							},
						},
					},
				},
			});

			if (!student) {
				throw new Error("Student not found");
			}

			// Calculate performance metrics
			const activities = student.activities;
			const attendance = student.attendance;
			const subjects = student.class?.classGroup.subjects || [];

			// Activity performance
			const activityMetrics = {
				total: activities.length,
				completed: activities.filter(a => a.status === 'SUBMITTED' || a.status === 'GRADED').length,
				graded: activities.filter(a => a.status === 'GRADED').length,
				averageGrade: activities.reduce((acc, curr) => acc + (curr.grade || 0), 0) / activities.length || 0,
			};

			// Attendance metrics
			const attendanceMetrics = {
				total: attendance.length,
				present: attendance.filter(a => a.status === 'PRESENT').length,
				absent: attendance.filter(a => a.status === 'ABSENT').length,
				late: attendance.filter(a => a.status === 'LATE').length,
				excused: attendance.filter(a => a.status === 'EXCUSED').length,
				attendanceRate: (attendance.filter(a => a.status === 'PRESENT').length / attendance.length) * 100 || 0,
			};

			// Subject-wise performance
			const subjectPerformance = subjects.map(subject => {
				const subjectActivities = activities.filter(a => 
					a.activity.classId === student.classId && 
					a.activity.type === 'EXAM'
				);

				return {
					subject: subject.name,
					activities: subjectActivities.length,
					averageGrade: subjectActivities.reduce((acc, curr) => acc + (curr.grade || 0), 0) / subjectActivities.length || 0,
				};
			});

			return {
				student,
				performance: {
					activities: activityMetrics,
					attendance: attendanceMetrics,
					subjects: subjectPerformance,
				},
			};
		}),
});