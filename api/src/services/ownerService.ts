import { AdminRoles } from '../generated/prisma/client';
import { prisma } from '../config/database';
import bcrypt from 'bcryptjs';
import { Auth } from './authService';
import { ApiResponse } from '../utils/apiResponse';

export class OwnerService {

    private static async validateOwnerUniqueness(role: AdminRoles) {
        if (role !== AdminRoles.OWNER) return;

        const existingOwner = await prisma.admin.findFirst({
            where: { role: AdminRoles.OWNER },
            select: { id: true }
        });

        if (existingOwner) {

            // Throwing an operational error that your controller's try-catch block will forward
            throw new Error("Owner already exist.");
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
                    // passwordHashed is explicitly omitted here for API security
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError(error);
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
            throw ApiResponse.internalServerError(error.message);
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
            throw ApiResponse.internalServerError(error);
        }
    }

    /**
     * Ref: Reset Admin Password.yml (PATCH {{baseURL}}{{ApiURL}}/admin/admins/:admin_id/password-reset)
     */
    public static async resetAdminPassword(adminId: string, passwordRaw: string) {
        try {
            const salt = await bcrypt.genSalt(10);
            const passwordHashed = await bcrypt.hash(passwordRaw, salt);

            return await prisma.admin.update({
                where: { id: adminId },
                data: {
                    passwordHashed: passwordHashed,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    username: true
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError(error);
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
                    username: true
                }
            });
        } catch (error: any) {
            throw ApiResponse.internalServerError(error);
        }
    }
}