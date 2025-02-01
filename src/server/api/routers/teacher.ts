import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status, UserType } from "@prisma/client";

export const teacherRouter = createTRPCRouter({
	createTeacher: protectedProcedure
		.input(z.object({
			name: z.string(),
			email: z.string().email(),
			specialization: z.string().optional(),
			availability: z.string().optional(),
			subjectIds: z.array(z.string()).optional(),
			classIds: z.array(z.string()).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { subjectIds, classIds, specialization, availability, ...userData } = input;

			// Create user with teacher profile
			const user = await ctx.prisma.user.create({
				data: {
					...userData,
					userType: UserType.TEACHER,
					teacherProfile: {
						create: {
							specialization,
							availability,
							...(subjectIds && {
								subjects: {
									create: subjectIds.map(subjectId => ({
										subject: { connect: { id: subjectId } },
										status: Status.ACTIVE,
									})),
								},
							}),
							...(classIds && {
								classes: {
									create: classIds.map(classId => ({
										class: { connect: { id: classId } },
										status: Status.ACTIVE,
									})),
								},
							}),
						},
					},
				},
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: true,
								},
							},
						},
					},
				},
			});

			return user;
		}),

	updateTeacher: protectedProcedure
		.input(z.object({
			id: z.string(),
			name: z.string().optional(),
			email: z.string().email().optional(),
			specialization: z.string().optional(),
			availability: z.string().optional(),
			subjectIds: z.array(z.string()).optional(),
			classIds: z.array(z.string()).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { id, subjectIds, classIds, ...updateData } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: id },
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			if (subjectIds) {
				await ctx.prisma.teacherSubject.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				if (subjectIds.length > 0) {
					await ctx.prisma.teacherSubject.createMany({
						data: subjectIds.map(subjectId => ({
							teacherId: teacherProfile.id,
							subjectId,
							status: Status.ACTIVE,
						})),
					});
				}
			}

			if (classIds) {
				await ctx.prisma.teacherClass.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				if (classIds.length > 0) {
					await ctx.prisma.teacherClass.createMany({
						data: classIds.map(classId => ({
							teacherId: teacherProfile.id,
							classId,
							status: Status.ACTIVE,
						})),
					});
				}
			}

			const updatedUser = await ctx.prisma.user.update({
				where: { id },
				data: {
					...updateData,
					teacherProfile: {
						update: {
							specialization: updateData.specialization,
							availability: updateData.availability,
						},
					},
				},
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: true,
								},
							},
						},
					},
				},
			});

			return updatedUser;
		}),

	deleteTeacher: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			return ctx.prisma.user.delete({
				where: { id: input },
			});
		}),

	getById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const teacher = await ctx.prisma.user.findFirst({
				where: { 
					id: input,
					userType: UserType.TEACHER 
				},
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: {
										include: {
											classGroup: true,
										},
									},
								},
							},
						},
					},
				},
			});

			if (!teacher) {
				throw new Error("Teacher not found");
			}

			return teacher;

		}),

	assignClasses: protectedProcedure
		.input(z.object({
			teacherId: z.string(),
			classIds: z.array(z.string()),
			subjectIds: z.array(z.string())
		}))
		.mutation(async ({ ctx, input }) => {
			const { teacherId, classIds, subjectIds } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: teacherId },
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			// Clear existing assignments
			await ctx.prisma.teacherClass.deleteMany({
				where: { teacherId: teacherProfile.id },
			});
			await ctx.prisma.teacherSubject.deleteMany({
				where: { teacherId: teacherProfile.id },
			});

			// Create new class assignments
			await ctx.prisma.teacherClass.createMany({
				data: classIds.map(classId => ({
					teacherId: teacherProfile.id,
					classId,
					status: Status.ACTIVE,
				})),
			});

			// Create new subject assignments
			await ctx.prisma.teacherSubject.createMany({
				data: subjectIds.map(subjectId => ({
					teacherId: teacherProfile.id,
					subjectId,
					status: Status.ACTIVE,
				})),
			});

			return ctx.prisma.user.findUnique({
				where: { id: teacherId },
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: true,
								},
							},
						},
					},
				},
			});
		}),

	searchTeachers: protectedProcedure
		.input(z.object({
			classIds: z.array(z.string()).optional(),
			subjectIds: z.array(z.string()).optional(),
			search: z.string().optional()
		}))
		.query(async ({ ctx, input }) => {
			const { search, classIds, subjectIds } = input;

			return ctx.prisma.user.findMany({
				where: {
					userType: UserType.TEACHER,
					...(search && {
						OR: [
							{ name: { contains: search, mode: 'insensitive' } },
							{ email: { contains: search, mode: 'insensitive' } },
							{
								teacherProfile: {
									specialization: { contains: search, mode: 'insensitive' },
								},
							},
						],
					}),
					...(subjectIds && subjectIds.length > 0 && {
						teacherProfile: {
							subjects: {
								some: {
									subjectId: { in: subjectIds }
								},
							},
						},
					}),
					...(classIds && classIds.length > 0 && {
						teacherProfile: {
							classes: {
								some: {
									classId: { in: classIds }
								},
							},
						},
					}),
				},
				include: {
					teacherProfile: {
						include: {
							subjects: {
								include: {
									subject: true,
								},
							},
							classes: {
								include: {
									class: {
										include: {
											classGroup: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: {
					name: 'asc',
				},
			});
		}),
});