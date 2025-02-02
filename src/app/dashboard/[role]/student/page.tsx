'use client';

import { StudentManagement } from "@/components/dashboard/roles/super-admin/student/StudentManagement";
import { useParams } from "next/navigation";

export default function StudentPage() {
	const params = useParams();
	const role = params.role as string;

	return (
		<div className="container mx-auto py-6">
			<StudentManagement />
		</div>
	);
}