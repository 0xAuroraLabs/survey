"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/components/auth-provider'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { db } from '@/lib/firebase'
import { collection, query, getDocs, orderBy, where, limit, doc, updateDoc } from 'firebase/firestore'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Gift, 
  UserCheck,
  AlertTriangle
} from 'lucide-react'

export default function AdminRewardsPage() {
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<any[]>([])
  const [claimedRewards, setClaimedRewards] = useState<any[]>([])
  const [processingIds, setProcessingIds] = useState<string[]>([])
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page.',
        variant: 'destructive',
      })
      router.push('/dashboard')
      return
    }

    // Fetch data
    fetchData()
  }, [user, router, toast])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch reward templates - these are rewards WITHOUT a userId
      const templatesQuery = query(
        collection(db, 'rewards'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )
      
      const templatesSnapshot = await getDocs(templatesQuery)
      const templatesData = templatesSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data() as any
        }))
        .filter(reward => !('userId' in reward)) // Ensure we only get templates
      
      // Fetch claimed rewards - these are rewards WITH a userId
      const claimedQuery = query(
        collection(db, 'rewards'),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      
      const claimedSnapshot = await getDocs(claimedQuery)
      const claimedData = claimedSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data() as any
        }))
        .filter(reward => 'userId' in reward) // Only get claimed rewards
      
      setTemplates(templatesData)
      setClaimedRewards(claimedData)
      
      console.log('Admin dashboard - Reward templates:', templatesData)
      console.log('Admin dashboard - Claimed rewards:', claimedData)
    } catch (error) {
      console.error('Error fetching reward data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load reward data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateRewardStatus = async (rewardId: string, newStatus: 'approved' | 'rejected') => {
    if (!rewardId) return;
    
    try {
      // Add to processing state
      setProcessingIds(prev => [...prev, rewardId]);
      
      // Update the reward status
      const rewardRef = doc(db, 'rewards', rewardId);
      await updateDoc(rewardRef, {
        status: newStatus,
        processedAt: new Date().toISOString(),
        processedBy: user?.uid
      });
      
      // Show success message
      toast({
        title: `Reward ${newStatus}`,
        description: `The reward has been ${newStatus} successfully.`,
        variant: newStatus === 'approved' ? 'default' : 'destructive',
      });
      
      // Update local state
      setClaimedRewards(prev => 
        prev.map(reward => 
          reward.id === rewardId 
            ? { ...reward, status: newStatus } 
            : reward
        )
      );
    } catch (error) {
      console.error(`Error ${newStatus} reward:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${newStatus} the reward. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      // Remove from processing state
      setProcessingIds(prev => prev.filter(id => id !== rewardId));
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const createDefaultTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/rewards/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create reward templates')
      }
      
      const data = await response.json()
      toast({
        title: 'Success',
        description: `Created ${data.addedTemplates?.length || 0} reward templates`,
      })
      
      // Refresh the data
      fetchData()
    } catch (error) {
      console.error('Error creating reward templates:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create reward templates',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Admin Rewards Management</CardTitle>
            <CardDescription>Loading user data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Admin Rewards Management</CardTitle>
          <CardDescription>Manage reward templates and user redemptions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="space-y-4">
            <TabsList>
              <TabsTrigger value="templates">Reward Templates</TabsTrigger>
              <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {templates.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground mb-4">No reward templates found</p>
                      <Button onClick={createDefaultTemplates}>Create Default Templates</Button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {templates.map((template) => (
                        <Card key={template.id}>
                          <CardHeader>
                            <CardTitle>{template.name}</CardTitle>
                            <CardDescription>{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex justify-between">
                              <span className="font-medium">Points required: {template.pointsRequired}</span>
                              <span className="capitalize px-2 py-1 bg-primary/10 text-primary rounded-md">
                                {template.status}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="pending" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {claimedRewards.filter(r => r.status === 'pending').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No pending reward claims</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {claimedRewards
                        .filter(reward => reward.status === 'pending')
                        .map((reward) => (
                          <Card key={reward.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{reward.name || 'Reward'}</CardTitle>
                                  <CardDescription>Claimed by: {reward.userId}</CardDescription>
                                </div>
                                {renderStatusBadge(reward.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="text-sm text-muted-foreground">Claimed: {new Date(reward.createdAt).toLocaleDateString()}</p>
                                  <p className="text-sm">{reward.description}</p>
                                </div>
                                <div className="flex space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                                    onClick={() => updateRewardStatus(reward.id, 'approved')}
                                    disabled={processingIds.includes(reward.id)}
                                  >
                                    {processingIds.includes(reward.id) ? (
                                      <div className="flex items-center">
                                        <Skeleton className="h-3.5 w-3.5 rounded-full mr-2 animate-pulse" />
                                        Processing...
                                      </div>
                                    ) : (
                                      <>
                                        <CheckCircle className="h-3.5 w-3.5 mr-2" />
                                        Approve
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800"
                                    onClick={() => updateRewardStatus(reward.id, 'rejected')}
                                    disabled={processingIds.includes(reward.id)}
                                  >
                                    {processingIds.includes(reward.id) ? (
                                      <div className="flex items-center">
                                        <Skeleton className="h-3.5 w-3.5 rounded-full mr-2 animate-pulse" />
                                        Processing...
                                      </div>
                                    ) : (
                                      <>
                                        <XCircle className="h-3.5 w-3.5 mr-2" />
                                        Reject
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="approved" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {claimedRewards.filter(r => r.status === 'approved').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No approved rewards</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {claimedRewards
                        .filter(reward => reward.status === 'approved')
                        .map((reward) => (
                          <Card key={reward.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{reward.name || 'Reward'}</CardTitle>
                                  <CardDescription>Claimed by: {reward.userId}</CardDescription>
                                </div>
                                {renderStatusBadge(reward.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Claimed: {new Date(reward.createdAt).toLocaleDateString()} | 
                                Approved: {reward.processedAt ? new Date(reward.processedAt).toLocaleDateString() : 'Unknown'}
                              </p>
                              <p className="text-sm">{reward.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="rejected" className="space-y-4">
              {loading ? (
                <div className="grid gap-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <>
                  {claimedRewards.filter(r => r.status === 'rejected').length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-muted-foreground">No rejected rewards</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {claimedRewards
                        .filter(reward => reward.status === 'rejected')
                        .map((reward) => (
                          <Card key={reward.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle>{reward.name || 'Reward'}</CardTitle>
                                  <CardDescription>Claimed by: {reward.userId}</CardDescription>
                                </div>
                                {renderStatusBadge(reward.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                Claimed: {new Date(reward.createdAt).toLocaleDateString()} | 
                                Rejected: {reward.processedAt ? new Date(reward.processedAt).toLocaleDateString() : 'Unknown'}
                              </p>
                              <p className="text-sm">{reward.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => router.push('/dashboard/admin')}>
              Back to Admin Dashboard
            </Button>
            <Button onClick={fetchData} disabled={loading}>
              Refresh Data
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 