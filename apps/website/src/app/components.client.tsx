'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { type ReactNode } from "react";
import { parseAsString, useQueryState } from 'nuqs'

export function YouTubeOptionsSelect({ groups }: { groups: string[] }) {
    const [group, setGroup] = useQueryState("youtube-group", { ...parseAsString.withDefault("popular"), clearOnDefault: true })

    return (
        <Select defaultValue='popular' value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Group" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="popular" defaultChecked>Popular</SelectItem>
                {groups.map((group) => (<SelectItem value={group!} key={group}>{group}</SelectItem>))}
            </SelectContent>
        </Select>
    )
}

export function YouTubeHigherOrLowerLink({ type, children, className }: { type: string, children: ReactNode, className?: string }) {
    const [group] = useQueryState("youtube-group", { ...parseAsString.withDefault("popular"), clearOnDefault: true })
    return <Link href={`/higher-or-lower?type=${type}&group=${group.replaceAll(" ", "+")}`} className={className}>{children}</Link>
}

