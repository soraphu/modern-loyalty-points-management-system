import { AdminRoles } from '../generated/prisma/client';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { Auth } from './authService';
import { ApiResponse } from '../utils/apiResponse';

export class OwnerService {

    public static async validateOwnerUniqueness(role: AdminRoles) {
        if (role !== AdminRoles.OWNER) return;

        const existingOwner = await prisma.admin.findFirst({
            where: { role: AdminRoles.OWNER },
            select: { id: true }
        });

        if (existingOwner) {
            throw ApiResponse.fail({ statusCode: 409, msg: 'Owner account already exist.', error_code: "OWNER_ALREADY_EXIST" });
        }
    }

    /**
     * Ref: Fetch Admins.yml (GET {{baseURL}}{{ApiURL}}/admin/admins)
     */
    public static async fetchAdmins() {
        try {
            return await prisma.admin.findMany({
                select: {
                    id: true,
                    role: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to fetch admins an unexpected internal server error occurred.');
        }
    }

    /**
     * Ref: Create Admin.yml (POST {{baseURL}}{{ApiURL}}/admin/admins)
     */
    public static async createAdmin(data: {
        username: string;
        firstname: string;
        lastname: string;
        password: string;
        role: AdminRoles;
    }) {
        try {
            const targetRole = data.role;

            await OwnerService.validateOwnerUniqueness(targetRole);

            const passwordHashed = await Auth.hashPassword(data.password);

            return await prisma.admin.create({
                data: {
                    username: data.username,
                    firstname: data.firstname,
                    lastname: data.lastname,
                    passwordHashed: passwordHashed,
                    role: data.role
                },
                select: {
                    id: true,
                    role: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
        } catch (error: any) {
            if (error.payload) {
                throw error;
            }
            throw ApiResponse.internalServerError('Unable to create admin an unexpected internal server error occurred.');
        }
    }

    /**
     * Ref: Edit Admin Role.yml (PATCH {{baseURL}}{{ApiURL}}/admin/admins/:admin_id/role-adjustment)
     */
    public static async adjustAdminRole(adminId: string, newRole: AdminRoles) {
        try {
            return await prisma.admin.update({
                where: { id: adminId },
                data: {
                    role: newRole,
                    updatedAt: new Date() // Force timestamp update on modification
                },
                select: {
                    id: true,
                    username: true,
                    role: true
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to adjust role an unexpected internal server error occurred.');
        }
    }

    /**
     * Ref: Reset Admin Password.yml (PATCH {{baseURL}}{{ApiURL}}/admin/admins/:admin_id/password-reset)
     */
    public static async resetAdminPassword(adminId: string, passwordRaw: string) {
        try {
            const passwordHashed = await Auth.hashPassword(passwordRaw);

            return await prisma.admin.update({
                where: { id: adminId },
                data: {
                    passwordHashed: passwordHashed,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    role: true,
                    updatedAt: true
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to reset admin password an unexpected internal server error occurred.');
        }
    }

    /**
     * Ref: Delete Admin.yml (DELETE {{baseURL}}{{ApiURL}}/admin/admins/:admin_id)
     */
    public static async deleteAdmin(adminId: string) {
        try {
            return await prisma.admin.delete({
                where: { id: adminId },
                select: {
                    id: true,
                    username: true,
                    firstname: true,
                    lastname: true,
                    role: true,
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError('Unable to delete admin account an unexpected internal server error occurred.');
        }
    }
}