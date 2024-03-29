"use client";

import { trpc } from "@/lib/trpc";
import { TeamsRecord } from "@/lib/xata";
import { Button } from "@superplexo/ui/button";
import { ScrollArea } from "@superplexo/ui/scroll-area";
import { SelectedPick } from "@xata.io/client";
import { HeartHandshakeIcon } from "lucide-react";
import { CreateTeam } from "./create-team";
import Link from "next/link";

type Props = {
  initialData: Readonly<SelectedPick<TeamsRecord, ["*"]>>[];
};

export const TeamsList = ({ initialData }: Props) => {
  let listAllTeams = trpc.listAllTeams.useQuery();
  let teams = listAllTeams.data || initialData || [];

  return (
    <>
      <CreateTeam />
      <ScrollArea className="h-[500px] w-full -mx-2">
        <div className="w-full px-2 py-1 space-y-1">
          {teams
            .sort((a, b) => {
              if (!a.name) return 1;
              if (!b.name) return -1;
              return a.name.localeCompare(b.name);
            })
            .map((team) => (
              <Button
                key={team.id}
                variant="ghost"
                className="w-[90%] h-8 justify-start"
                asChild
              >
                <Link href={`/teams/${team.slug}`}>
                  <HeartHandshakeIcon className="w-4 h-4 mr-2 text-primary" />
                  <span>
                    {team.name.length > 20
                      ? team.name.slice(0, 18) + "..."
                      : team.name}
                  </span>
                </Link>
              </Button>
            ))}
        </div>
      </ScrollArea>
    </>
  );
};
