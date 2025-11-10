import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // 🔹 Créer un utilisateur - CORRIGÉ
  async create(data: {
    email: string;
    username: string;
    password: string;
    userType?: string; // Ajouté userType
  }) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        passwordHash,
        userType: data.userType || 'internal', // Valeur par défaut
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
        userType: true,
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

  // 🔹 Trouver un utilisateur par email
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  // 🔹 Mettre à jour un utilisateur
  async update(
    id: number,
    data: {
      email?: string;
      username?: string;
      password?: string;
      userType?: string;
      isActive?: boolean;
    },
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser)
      throw new NotFoundException(`Utilisateur ${id} introuvable`);

    // Vérifier si le nouvel email existe déjà
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    const updateData: {
      email?: string;
      username?: string;
      userType?: string;
      passwordHash?: string;
      isActive?: boolean;
    } = {};

    if (typeof data.email === 'string') updateData.email = data.email;
    if (typeof data.username === 'string') updateData.username = data.username;
    if (typeof data.userType === 'string') updateData.userType = data.userType;
    if (typeof data.isActive === 'boolean') updateData.isActive = data.isActive;

    if (typeof data.password === 'string' && data.password.length > 0) {
      const hashed = await bcrypt.hash(data.password, 10);
      updateData.passwordHash = hashed;
    }

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
