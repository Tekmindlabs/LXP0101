import { Status } from "@prisma/client";

export enum TeacherType {
	CLASS = "CLASS",
	SUBJECT = "SUBJECT"
}

export interface Student {

	id: string;
	name: string;
	email: string;
	status: Status;
	studentProfile: {
		dateOfBirth: Date;
		class?: {
			name: string;
			classGroup: {
				name: string;
				program: {
					name: string | null;
				};
			};
		};
		parent?: {
			user: {
				name: string;
			};
		};
		attendance: {
			status: string;
		}[];
		activities: {
			status: string;
			grade?: number;
		}[];
	};
}

export interface Teacher {
	id: string;
	name: string;
	email: string;
	phoneNumber: string;
	status: Status;
	teacherProfile: {
		teacherType: TeacherType;
		specialization: string | null;
		availability: string | null;
		subjects: { subject: { id: string; name: string } }[];
		classes: { 
			class: { 
				id: string; 
				name: string;
				classGroup: { name: string } 
			};
			isClassTeacher: boolean;
		}[];
	};
}
