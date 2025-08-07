import { PrismaClient, stg_user, stg_profile, stg_phone } from '@prisma/client';

export type UserWithRelations = stg_user & {
  stg_profile: stg_profile | null;
  stg_phone: stg_phone[];
};

export class StgUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany({
    take,
    cursor,
    skip,
  }: {
    take: number;
    cursor?: { id: number };
    skip?: number;
  }): Promise<UserWithRelations[]> {
    return this.prisma.stg_user.findMany({
      take,
      orderBy: { id: 'asc' },
      ...(cursor ? { cursor, skip } : {}),
      include: {
        stg_profile: true,
        stg_phone: true,
      },
    });
  }

  async create(data: any): Promise<stg_user> {
    return this.prisma.stg_user.create({
      data,
    });
  }
}