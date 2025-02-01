'use client';

import { type FC } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";

interface TeacherViewProps {
	isOpen: boolean;
	onClose: () => void;
	teacherId: string;
	onEdit: () => void;
}

export const TeacherView: FC<TeacherViewProps> = ({ isOpen, onClose, teacherId, onEdit }) => {
	const { toast } = useToast();

	const { data: teacher, isLoading, error: queryError } = api.teacher.getById.useQuery(
		teacherId,
		{
			enabled: !!teacherId && isOpen,
			retry: 1,
			refetchOnWindowFocus: false,
		}
	);

	if (queryError) {
		console.error('Error fetching teacher:', queryError);
		toast({
			title: "Error",
			description: "Failed to load teacher information",
			variant: "destructive",
		});
	}


	if (!isOpen) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl">
				<DialogHeader className="flex flex-row items-center justify-between">
					<DialogTitle>
						{isLoading ? "Loading..." : queryError ? "Error" : `Teacher Profile: ${teacher?.name}`}
					</DialogTitle>
					{!isLoading && !queryError && teacher && (
						<Button onClick={onEdit}>Edit Profile</Button>
					)}
				</DialogHeader>

				{isLoading && (
					<div className="flex items-center justify-center p-6">
						<div>Loading teacher information...</div>
					</div>
				)}

				{queryError && (
					<div className="flex items-center justify-center p-6">
						<div>Failed to load teacher information. Please try again.</div>
					</div>
				)}

				{!isLoading && !queryError && teacher && (
					<Tabs defaultValue="information" className="w-full">
						<TabsList className="grid w-full grid-cols-3">

						<TabsTrigger value="information">Information</TabsTrigger>
						<TabsTrigger value="schedule">Schedule</TabsTrigger>
						<TabsTrigger value="analytics">Analytics</TabsTrigger>
					</TabsList>
					
					<TabsContent value="information">
						<div className="grid gap-4 md:grid-cols-2 mt-4">
							<Card>
								<CardContent className="pt-6">
									<h3 className="mb-4 text-lg font-semibold">Personal Information</h3>
									<dl className="space-y-2">
										<div>
											<dt className="text-sm font-medium text-muted-foreground">Name</dt>
											<dd>{teacher.name}</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-muted-foreground">Email</dt>
											<dd>{teacher.email}</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-muted-foreground">Specialization</dt>
											<dd>{teacher.teacherProfile?.specialization || 'Not specified'}</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-muted-foreground">Availability</dt>
											<dd>{teacher.teacherProfile?.availability || 'Not specified'}</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-muted-foreground">Status</dt>
											<dd>{teacher.status}</dd>
										</div>
									</dl>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="pt-6">
									<h3 className="mb-4 text-lg font-semibold">Assigned Subjects</h3>
									{teacher.teacherProfile?.subjects.length ? (
										<ul className="space-y-2">
											{teacher.teacherProfile.subjects.map((s) => (
												<li key={s.subject.id} className="flex items-center">
													<span>{s.subject.name}</span>
												</li>
											))}
										</ul>
									) : (
										<p className="text-sm text-muted-foreground">No subjects assigned</p>
									)}
								</CardContent>
							</Card>

							<Card className="md:col-span-2">
								<CardContent className="pt-6">
									<h3 className="mb-4 text-lg font-semibold">Assigned Classes</h3>
									{teacher.teacherProfile?.classes.length ? (
										<div className="grid gap-4 md:grid-cols-2">
											{teacher.teacherProfile.classes.map((c) => (
												<Card key={c.class.id}>
													<CardContent className="p-4">
														<h4 className="font-medium">{c.class.name}</h4>
														<p className="text-sm text-muted-foreground">
															{c.class.classGroup.name}
														</p>
													</CardContent>
												</Card>
											))}
										</div>
									) : (
										<p className="text-sm text-muted-foreground">No classes assigned</p>
									)}
								</CardContent>
							</Card>
						</div>
					</TabsContent>
					
					<TabsContent value="schedule">
						<Card className="mt-4">
							<CardContent className="p-6">
								<h3 className="text-lg font-semibold mb-4">Teacher Schedule</h3>
								{/* TODO: Implement teacher schedule view */}
								<p className="text-muted-foreground">Schedule details will be displayed here</p>
							</CardContent>
						</Card>
					</TabsContent>
					
					<TabsContent value="analytics">
						<Card className="mt-4">
							<CardContent className="p-6">
								<h3 className="text-lg font-semibold mb-4">Teacher Analytics</h3>
								{/* TODO: Implement teacher analytics view */}
								<p className="text-muted-foreground">Analytics and performance metrics will be displayed here</p>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			)}
		</DialogContent>
	</Dialog>
    );
};