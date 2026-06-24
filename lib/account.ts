import { db } from "@/lib/db";

export async function claimAnonData(userId: string, anonId: string) {
  if (!anonId) {
    return;
  }

  await db.$transaction(async (tx) => {
    await tx.decision.updateMany({
      where: {
        anonId,
        userId: null
      },
      data: {
        userId,
        anonId: null
      }
    });

    await tx.decisionReview.updateMany({
      where: {
        anonId,
        userId: null
      },
      data: {
        userId,
        anonId: null
      }
    });

    const existingUserProfile = await tx.userProfile.findUnique({
      where: {
        userId
      },
      select: {
        id: true
      }
    });

    if (!existingUserProfile) {
      await tx.userProfile.updateMany({
        where: {
          anonId,
          userId: null
        },
        data: {
          userId,
          anonId: null
        }
      });
    }
  });
}
