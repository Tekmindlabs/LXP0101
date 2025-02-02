import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { Status, UserType, type Prisma } from "@prisma/client";

// Define TeacherType enum since it's not in Prisma client
export enum TeacherType {
	CLASS = 'CLASS',
	SUBJECT = 'SUBJECT'
}




export const teacherRouter = createTRPCRouter({
	createTeacher: protectedProcedure
		.input(z.object({
		  name: z.string(),
		  email: z.string().email(),
		  phoneNumber: z.string(),
		  teacherType: z.nativeEnum(TeacherType),
		  specialization: z.string().optional(),
		  availability: z.string().optional(),
		  subjectIds: z.array(z.string()).optional(),
		  classIds: z.array(z.string()).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
		  const { subjectIds = [], classIds = [], specialization, availability, teacherType, ...userData } = input;

		  const createInput: Prisma.UserCreateInput = {
			...userData,
			userType: UserType.TEACHER,
			teacherProfile: {
			  create: {
				specialization,
				availability,
				teacherType,
				permissions: teacherType === TeacherType.CLASS
				  ? ["VIEW_CLASS", "MANAGE_ATTENDANCE", "MANAGE_STUDENTS", "VIEW_REPORTS"]
				  : ["VIEW_SUBJECT", "MANAGE_ATTENDANCE"],
				subjects: {
				  create: subjectIds.map(subjectId => ({
					subject: { connect: { id: subjectId } },
					status: Status.ACTIVE,
				  })),
				},
				classes: {
				  create: classIds.map(classId => ({
					class: { connect: { id: classId } },
					status: Status.ACTIVE,
					isClassTeacher: teacherType === TeacherType.CLASS,
				  })),
				},
			  },
			},
		  };

		  const user = await ctx.prisma.user.create({
			data: createInput,

				include: {
					teacherProfile: {
						include: {
							subjects: { include: { subject: true } },
							classes: { include: { class: true } },
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
			phoneNumber: z.string().optional(),
			teacherType: z.nativeEnum(TeacherType).optional(),
			specialization: z.string().optional(),
			availability: z.string().optional(),
			subjectIds: z.array(z.string()).optional(),
			classIds: z.array(z.string()).optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const { id, subjectIds = [], classIds = [], teacherType, ...updateData } = input;

			const teacherProfile = await ctx.prisma.teacherProfile.findUnique({
				where: { userId: id },
				include: { user: true },
			});

			if (!teacherProfile) {
				throw new Error("Teacher profile not found");
			}

			if (teacherType) {
				await ctx.prisma.teacherProfile.update({
					where: { id: teacherProfile.id },
					data: {
						teacherType,
					},
				});
			}


			// Handle subject assignments
			if (subjectIds.length > 0) {
				await ctx.prisma.teacherSubject.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				await ctx.prisma.teacherSubject.createMany({
					data: subjectIds.map(subjectId => ({
						teacherId: teacherProfile.id,
						subjectId,
						status: Status.ACTIVE,
					})),
				});
			}

			// Handle class assignments
			if (classIds.length > 0) {
				await ctx.prisma.teacherClass.deleteMany({
					where: { teacherId: teacherProfile.id },
				});

				await ctx.prisma.teacherClass.createMany({
					data: classIds.map(classId => ({
						teacherId: teacherProfile.id,
						classId,
						status: Status.ACTIVE,
						isClassTeacher: teacherType === TeacherType.CLASS,
					})),
				});
			}

			const userUpdateData: Prisma.UserUpdateInput = {
				...(updateData.name && { name: updateData.name }),
				...(updateData.email && { email: updateData.email }),
				...(updateData.phoneNumber && { phoneNumber: updateData.phoneNumber }),
				teacherProfile: {
					update: {
						...(updateData.specialization && { specialization: updateData.specialization }),
						...(updateData.availability && { availability: updateData.availability }),
					},
				},
			};

			return ctx.prisma.user.update({
				where: { id },
				data: userUpdateData,
				include: {
					teacherProfile: {
						include: {
							subjects: { include: { subject: true } },
							classes: { include: { class: true } },
						},
					},
				},
			});
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
				select: {
					id: true,
					teacherType: true,
				},
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
			if (classIds.length > 0) {
				await ctx.prisma.teacherClass.createMany({
					data: classIds.map(classId => ({
						teacherId: teacherProfile.id,
						classId,
						status: Status.ACTIVE,
						isClassTeacher: teacherProfile.teacherType === 'CLASS',
					})),
				});
			}

			// Create new subject assignments
			if (subjectIds.length > 0) {
				await ctx.prisma.teacherSubject.createMany({
					data: subjectIds.map(subjectId => ({
						teacherId: teacherProfile.id,
						subjectId,
						status: Status.ACTIVE,
					})),
				});
			}

			return ctx.prisma.user.findUnique({
				where: { id: teacherId },
				include: {
					teacherProfile: {
						include: {
							subjects: { include: { subject: true } },
							classes: { include: { class: true } },
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

			const where: Prisma.UserWhereInput = {
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
				AND: [
					...(subjectIds && subjectIds.length > 0
						? [{
								teacherProfile: {
									subjects: {
										some: {
											subjectId: { in: subjectIds }
										},
									},
								},
							}]
						: []),
					...(classIds && classIds.length > 0
						? [{
								teacherProfile: {
									classes: {
										some: {
											classId: { in: classIds }
										},
									},
								},
							}]
						: []),
				],
			};

			return ctx.prisma.user.findMany({
				where,
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