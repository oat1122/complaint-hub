import { prisma } from "@/lib/db/prisma";
import { getCachedData } from "@/lib/cache/memory-cache";

export async function getDashboardStats() {
  // Get total complaints count
  const totalComplaints = await prisma.complaint.count();
  
  // Get today's complaints count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysComplaints = await prisma.complaint.count({
    where: {
      createdAt: {
        gte: today
      }
    }
  });
  
  // Get status counts in a single query
  const statusCounts = await prisma.$queryRaw`
    SELECT 
      status, 
      COUNT(*) as count
    FROM complaints
    GROUP BY status
  `;
  
  // Format status counts into an object
  const statusCountsObj = statusCounts.reduce((acc: any, curr: any) => {
    acc[curr.status] = Number(curr.count);
    return acc;
  }, {});
  
  // Get category distribution in a single query
  const categoryStats = await prisma.complaint.groupBy({
    by: ['category'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  });
  
  // Format category stats
  const categoryDistribution = categoryStats.map(stat => ({
    category: stat.category,
    count: stat._count.id
  }));
  
  // Get attachments count
  const totalAttachments = await prisma.attachment.count();
  
  // Get unresolved complaints by priority
  const priorityCounts = await prisma.complaint.groupBy({
    by: ['priority'],
    where: {
      status: {
        notIn: ['resolved', 'archived']
      }
    },
    _count: true
  });
  
  // Format priority counts
  const priorityDistribution = priorityCounts.map(item => ({
    priority: item.priority,
    count: item._count
  }));
  
  return {
    totalComplaints,
    todaysComplaints,
    statusCounts: statusCountsObj,
    categoryDistribution,
    totalAttachments,
    priorityDistribution
  };
}

// Cached version of getDashboardStats
export async function getDashboardStatsWithCache() {
  return getCachedData(
    'dashboard:stats',
    () => getDashboardStats(),
    300 // 5 minutes cache
  );
}
