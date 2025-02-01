import TeacherProfileView from "@/components/dashboard/roles/teacher/TeacherProfileView";

interface TeacherProfilePageProps {
	params: {
		id: string;
	};
}

export default function TeacherProfilePage({ params }: TeacherProfilePageProps) {
	return (
		<div className="container mx-auto py-6">
			<TeacherProfileView teacherId={params.id} />
		</div>
	);
}