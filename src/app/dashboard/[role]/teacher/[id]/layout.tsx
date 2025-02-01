import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

export default function TeacherProfileLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { role: string; id: string };
}) {
	return (
		<div className="space-y-6">
			<Breadcrumb>
				<BreadcrumbItem>
					<BreadcrumbLink href={`/dashboard/${params.role}`}>Dashboard</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbItem>
					<ChevronRight className="h-4 w-4" />
					<BreadcrumbLink href={`/dashboard/${params.role}/teachers`}>Teachers</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbItem>
					<ChevronRight className="h-4 w-4" />
					<span>Profile</span>
				</BreadcrumbItem>
			</Breadcrumb>
			{children}
		</div>
	);
}