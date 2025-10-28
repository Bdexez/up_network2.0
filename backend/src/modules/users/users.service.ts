import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Créer un utilisateur
  async create(data: { email: string; username: string; password: string }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        isActive: true,
      },
    });
  }

  // 🔹 Récupérer tous les utilisateurs
  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // 🔹 Récupérer un utilisateur précis
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);
    return user;
  }

  // 🔹 Mettre à jour un utilisateur
  async update(
    id: number,
    data: {
      email?: string;
      username?: string;
      password?: string;
      isActive?: boolean;
    },
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser)
      throw new NotFoundException(`Utilisateur ${id} introuvable`);

    // Typage explicite pour updateData — pas de any
    const updateData: {
      email?: string;
      username?: string;
      passwordHash?: string;
      isActive?: boolean;
    } = {};

    if (typeof data.email === 'string') updateData.email = data.email;
    if (typeof data.username === 'string') updateData.username = data.username;
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

    if (typeof data.password === 'string' && data.password.length > 0) {
      // bcrypt.hash retourne Promise<string>, typé correctement
      const hashed = await bcrypt.hash(data.password, 10);
      updateData.passwordHash = hashed;
    }

    // cast final vers le type attendu par Prisma pour éviter l'usage d'any
    return this.prisma.user.update({
      where: { id },
      data: updateData as Prisma.UserUpdateInput,
    });
  }

  // 🔹 Supprimer un utilisateur
  async delete(id: number) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser)
      throw new NotFoundException(`Utilisateur ${id} introuvable`);

    await this.prisma.user.delete({ where: { id } });
    return { message: `Utilisateur ${id} supprimé avec succès` };
  }
}
