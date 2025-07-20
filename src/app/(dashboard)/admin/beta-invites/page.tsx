'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { betaAccessService, BetaInvite } from '@/lib/beta-access';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function BetaInvitesPage() {
  const { user, profile } = useAuth();
  const [invites, setInvites] = useState<BetaInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [maxUses, setMaxUses] = useState(1);
  const [expiresInDays, setExpiresInDays] = useState(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadInvites();
    }
  }, [profile]);

  const loadInvites = async () => {
    setLoading(true);
    try {
      const data = await betaAccessService.getAllInvites();
      setInvites(data);
    } catch (error) {
      console.error('Error loading invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    if (!user) return;
    
    setCreating(true);
    try {
      const result = await betaAccessService.createInvite({
        email: email || undefined,
        maxUses,
        expiresInDays: expiresInDays || undefined,
        notes: notes || undefined,
        createdBy: user.id,
      });

      if (result.success) {
        await loadInvites();
        // Reset form
        setEmail('');
        setMaxUses(1);
        setExpiresInDays(30);
        setNotes('');
        
        // Show success message
        alert(`Invite created! Code: ${result.invite?.code}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating invite:', error);
      alert('Failed to create invite');
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to view this page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Beta Invites</h1>
        <p className="text-muted-foreground mt-2">
          Manage beta access invitations for ZebaMail
        </p>
      </div>

      {/* Create Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Invite</CardTitle>
          <CardDescription>
            Generate a new beta invite code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Leave empty for a general invite code
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses</Label>
              <Input
                id="maxUses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresInDays">Expires In (Days)</Label>
              <Input
                id="expiresInDays"
                type="number"
                min="0"
                placeholder="30"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Leave as 0 for no expiration
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                placeholder="Internal notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="mt-4"
            onClick={handleCreateInvite}
            disabled={creating}
          >
            <Plus className="w-4 h-4 mr-2" />
            {creating ? 'Creating...' : 'Create Invite'}
          </Button>
        </CardContent>
      </Card>

      {/* Invites Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invites</CardTitle>
          <CardDescription>
            {invites.length} total invites created
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : invites.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No invites created yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Uses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => {
                  const isExpired = invite.expires_at && new Date(invite.expires_at) < new Date();
                  const isUsedUp = invite.uses_count >= invite.max_uses;
                  const isActive = !isExpired && !isUsedUp;

                  return (
                    <TableRow key={invite.id}>
                      <TableCell className="font-mono">{invite.code}</TableCell>
                      <TableCell>{invite.email || '-'}</TableCell>
                      <TableCell>
                        {invite.uses_count} / {invite.max_uses}
                      </TableCell>
                      <TableCell>
                        {isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : isExpired ? (
                          <Badge variant="secondary">Expired</Badge>
                        ) : (
                          <Badge variant="secondary">Used Up</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(invite.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {invite.expires_at
                          ? format(new Date(invite.expires_at), 'MMM d, yyyy')
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(invite.code)}
                        >
                          {copiedCode === invite.code ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}