import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Plus, UserPlus, Users } from "lucide-react"

import { ContactFormDialog } from "@/components/money-split/ContactFormDialog"
import { GroupFormDialog } from "@/components/money-split/GroupFormDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getContacts } from "@/shared/api/contact.api"
import { getGroups } from "@/shared/api/group.api"
import { notifyCreated, notifyError } from "@/shared/lib/notify"

export function GroupsListPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)
  const [directDialogOpen, setDirectDialogOpen] = useState(false)
  const [groupDialogOpen, setGroupDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [groupsRes, contactsRes] = await Promise.all([getGroups(), getContacts()])
      setGroups(groupsRes.groups || [])
      setContacts(contactsRes.contacts || [])
    } catch (err) {
      notifyError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold font-[family-name:var(--font-display)]">
            Your splits
          </h2>
          <p className="text-sm text-muted-foreground">
            Create direct or group splits and track who owes what.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setContactDialogOpen(true)}>
            <UserPlus className="size-4" />
            Add contact
          </Button>
          <Button variant="outline" onClick={() => setDirectDialogOpen(true)}>
            <Plus className="size-4" />
            Direct split
          </Button>
          <Button onClick={() => setGroupDialogOpen(true)}>
            <Users className="size-4" />
            New group
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Groups</CardTitle>
          <CardDescription>All direct and group splits you belong to.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading groups...</p>
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No splits yet. Create a direct split or group to get started.
            </p>
          ) : (
            groups.map((group) => (
              <Link
                key={group._id}
                to={`/money-split/groups/${group._id}`}
                className="flex items-center justify-between rounded-md border px-3 py-3 transition-colors hover:bg-accent/40"
              >
                <div>
                  <p className="font-medium">{group.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {group.type} · {group.memberCount} members
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">View</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contacts</CardTitle>
          <CardDescription>Saved phone numbers for quick splitting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {contacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contacts saved yet.</p>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact._id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{contact.displayName}</p>
                  <p className="text-xs text-muted-foreground">{contact.phone}</p>
                </div>
                <span className="text-xs capitalize text-muted-foreground">
                  {contact.linkedUser?.accountState || "pending"}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <ContactFormDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSuccess={() => {
          notifyCreated("Contact saved")
          fetchData()
        }}
        onError={notifyError}
      />

      <GroupFormDialog
        open={directDialogOpen}
        onOpenChange={setDirectDialogOpen}
        type="direct"
        onSuccess={(group) => {
          notifyCreated("Direct split ready")
          fetchData()
          navigate(`/money-split/groups/${group._id}`)
        }}
        onError={notifyError}
      />

      <GroupFormDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        type="group"
        onSuccess={(group) => {
          notifyCreated("Group created")
          fetchData()
          navigate(`/money-split/groups/${group._id}`)
        }}
        onError={notifyError}
      />
    </div>
  )
}
