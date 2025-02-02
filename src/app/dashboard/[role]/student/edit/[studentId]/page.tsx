'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';


const formSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	email: z.string().email({ message: 'Invalid email address' }),
	dateOfBirth: z.date({ message: 'Date of birth is required' }),
	classId: z.string().min(1, { message: 'Class is required' }),
});


type FormData = z.infer<typeof formSchema>;

export default function EditStudentPage() {
	const params = useParams();
	const studentId = params.studentId as string;
	const role = params.role as string;
	const router = useRouter();
	const { toast } = useToast();
	const { data: classes = [] } = api.class.list.useQuery();
	const { data: student } = api.student.getStudent.useQuery(studentId);
	const updateStudentMutation = api.student.updateStudent.useMutation({
		onSuccess: () => {
			toast({
				title: 'Student updated successfully',
				description: 'Student has been updated',
			});
			router.push(`/dashboard/${role}/student`);
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to update student',
				variant: 'destructive',
			});
		},
	});

	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: '',
			email: '',
			dateOfBirth: new Date(),
			classId: '',
		},
	});

	const { setValue } = form;

	useEffect(() => {
		if (student && student.studentProfile) {
			setValue('name', student.name || '');
			setValue('email', student.email || '');
			if (student.studentProfile.dateOfBirth) {
				setValue('dateOfBirth', new Date(student.studentProfile.dateOfBirth));
			}
			if (student.studentProfile.classId) {
				setValue('classId', student.studentProfile.classId);
			}
		}
	}, [student, setValue]);

	const onSubmit = (data: FormData) => {
		updateStudentMutation.mutate({
			id: studentId,
			...data,
		});
	};


	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<div className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Name" {...field} />
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>

						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input type="email" placeholder="Email" {...field} />
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>

						<FormField
							control={form.control}
							name="dateOfBirth"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Date of Birth</FormLabel>
									<FormControl>
										<Input 
											type="date" 
											{...field} 
											value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} 
											onChange={(e) => field.onChange(new Date(e.target.value))} 
										/>
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>

						<FormField
							control={form.control}
							name="classId"
							render={({ field }) => (
								<div className="space-y-2">
									<FormLabel>Class</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger>
												<SelectValue placeholder="Select class" />
											</SelectTrigger>
											<SelectContent>
												{classes.map((cls) => (
													<SelectItem key={cls.id} value={cls.id}>
														{cls.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</div>
							)}
						/>
					</div>

					<Button type="submit">Update Student</Button>
				</form>
			</Form>
		</div>
	);
}