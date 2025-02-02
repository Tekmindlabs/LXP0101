'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/utils/api';
import { useToast } from '@/hooks/use-toast';
import { Class } from '@prisma/client';

const formSchema = z.object({
	name: z.string().min(1, { message: 'Name is required' }),
	email: z.string().email({ message: 'Invalid email address' }),
	dateOfBirth: z.date({ message: 'Date of birth is required' }),
	classId: z.string().min(1, { message: 'Class is required' }),
	parentName: z.string().optional(),
	parentEmail: z.string().email().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateStudentPage() {
	const router = useRouter();
	const { toast } = useToast();
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [copied, setCopied] = useState(false);

	const { data: classes = [] } = api.class.list.useQuery();
	const createStudentMutation = api.student.createStudent.useMutation({
		onSuccess: (result) => {
			if (result.studentProfile?.credentials) {
				setPassword(result.studentProfile.credentials);
			}
			toast({
				title: 'Student created successfully',
				description: `Student ${result.name} has been created`,
			});
			router.push('/dashboard/admin/student');
		},
		onError: () => {
			toast({
				title: 'Error',
				description: 'Failed to create student',
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
			parentName: '',
			parentEmail: '',
		},
	});

	const handleCopy = () => {
		navigator.clipboard.writeText(password);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const onSubmit = (data: FormData) => {
		createStudentMutation.mutate(data);
	};



	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
				{password && (
					<div className="space-y-2">
						<FormLabel>Generated Password</FormLabel>
						<div className="flex items-center">
							<Input type={showPassword ? 'text' : 'password'} value={password} readOnly />
							<Button
								type="button"
								variant="ghost"
								onClick={() => setShowPassword(!showPassword)}
								className="ml-2"
							>
								{showPassword ? 'Hide' : 'Show'}
							</Button>
							<Button
								onClick={handleCopy}
								className="ml-2"
								disabled={copied}
							>
								{copied ? 'Copied!' : 'Copy'}
							</Button>
						</div>
					</div>
				)}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormControl>
							<FormLabel>Name</FormLabel>
							<Input placeholder="Name" {...field} />
							<FormMessage />
						</FormControl>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormControl>
							<FormLabel>Email</FormLabel>
							<Input type="email" placeholder="Email" {...field} />
							<FormMessage />
						</FormControl>
					)}
				/>

				<FormField
					control={form.control}
					name="dateOfBirth"
					render={({ field }) => (
						<FormControl>
							<FormLabel>Date of Birth</FormLabel>
							<Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(new Date(e.target.value))} />
							<FormMessage />
						</FormControl>
					)}
				/>

				<FormField
					control={form.control}
					name="classId"
					render={({ field }) => (
						<FormControl>
							<FormLabel>Class</FormLabel>
							<Select onValueChange={field.onChange} value={field.value}>
								<SelectTrigger>
									<SelectValue placeholder="Select class" />
								</SelectTrigger>
								<SelectContent>
									{(classes as any[]).map((cls) => (
										<SelectItem key={cls.id} value={cls.id}>
											{cls.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FormMessage />
						</FormControl>
					)}
				/>

				<FormField
					control={form.control}
					name="parentName"
					render={({ field }) => (
						<FormControl>
							<FormLabel>Parent Name</FormLabel>
							<Input placeholder="Parent Name" {...field} />
							<FormMessage />
						</FormControl>
					)}
				/>

				<FormField
					control={form.control}
					name="parentEmail"
					render={({ field }) => (
						<FormControl>
							<FormLabel>Parent Email</FormLabel>
							<Input type="email" placeholder="Parent Email" {...field} />
							<FormMessage />
						</FormControl>
					)}
				/>


				<Button type="submit">Create Student</Button>
			</form>
		</Form>
	);
}

