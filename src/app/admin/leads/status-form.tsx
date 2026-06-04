"use client";

import { useFormState } from "react-dom";
import { Select } from "@/components/ui/select";
import { type ActionResult } from "@/lib/forms";
import { updateLeadStatus } from "./actions";
import type { ContactRequestStatus } from "@prisma/client";

export function LeadStatusForm({ id, current }: { id: string; current: ContactRequestStatus }) {
  const [, action] = useFormState<ActionResult, FormData>(updateLeadStatus, { ok: true });
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Select
        name="status"
        defaultValue={current}
        onChange={(e) => {
          const fd = new FormData();
          fd.set("id", id);
          fd.set("status", e.target.value);
          action(fd);
        }}
        className="w-36 text-xs"
      >
        <option value="NEW">New</option>
        <option value="CONTACTED">Contacted</option>
        <option value="CONVERTED">Converted</option>
        <option value="ARCHIVED">Archived</option>
      </Select>
    </form>
  );
}
