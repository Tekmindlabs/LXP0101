'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeacherForm } from "@/components/dashboard/roles/super-admin/teacher/TeacherForm";
import { api } from "@/utils/api";

export default function EditTeacherPage({ params }: { params: { id: string } }) {
	const router = useRouter();
	const teacherId = use(Promise.resolve(params.id));
	const { data: teacher } = api.teacher.getById.useQuery(teacherId);
	const { data: subjects } = api.subject.searchSubjects.useQuery({});
	const { data: classes } = api.class.searchClasses.useQuery({});

	if (!teacher || !teacher.teacherProfile) {
		return <div>Loading...</div>;
	}

	// Ensure all required fields are non-null before passing to TeacherForm
	const formattedTeacher = {
		id: teacher.id,
		name: teacher.name || '',
		email: teacher.email || '',
		phoneNumber: teacher.phoneNumber || '',
		status: teacher.status,
		teacherProfile: {
			teacherType: teacher.teacherProfile.teacherType,
			specialization: teacher.teacherProfile.specialization || '',
			availability: teacher.teacherProfile.availability || '',
			subjects: teacher.teacherProfile.subjects || [],
			classes: teacher.teacherProfile.classes || [],
		}
	};

	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader>
					<CardTitle>Edit Teacher</CardTitle>
				</CardHeader>
				<CardContent>
					<TeacherForm
						isCreate={false}
						selectedTeacher={formattedTeacher}
						onClose={() => router.back()}
						subjects={subjects || []}
						classes={classes || []}
					/>
				</CardContent>
			</Card>
		</div>
	);
}