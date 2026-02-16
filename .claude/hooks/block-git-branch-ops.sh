#!/bin/bash

# Claude Code PreToolUse Hook: Block git branch operations
# πüôπü«πé╣πé»πâ¬πâùπâêπü» git checkout, git switch, git branch, git worktree πé│πâ₧πâ│πâëπéÆπâûπâ¡πââπé»πüùπü╛πüÖ

# git branch πé│πâ₧πâ│πâëπüîσÅéτàºτ│╗πüïπü⌐πüåπüïπéÆσêñσ«Ü
# Φ¿▒σÅ»πâ¬πé╣πâêµû╣σ╝Å∩╝ÜσÅéτàºτ│╗πâòπâ⌐πé░πü«πü┐Φ¿▒σÅ»πÇüπü¥πéîΣ╗Ñσñûπü»πâûπâ¡πââπé»
is_read_only_git_branch() {
    local branch_args="$1"

    # πâêπâ¬πâá
    branch_args=$(echo "$branch_args" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')

    # σ╝òµò░πü¬πüùπü»Φ¿▒σÅ»∩╝êπâûπâ⌐πâ│πâüΣ╕ÇΦªºΦí¿τñ║∩╝ë
    if [ -z "$branch_args" ]; then
        return 0
    fi

    # σÅéτàºτ│╗πâòπâ⌐πé░πü«πü┐πü«σá┤σÉêπü»Φ¿▒σÅ»
    # Φ¿▒σÅ»πâ¬πé╣πâê: --list, --show-current, --all, -a, --remotes, -r, --contains, --merged, --no-merged, --points-at, --format, --sort, --abbrev, -v, -vv, --verbose
    if echo "$branch_args" | grep -qE '^(--list|--show-current|--all|-a|--remotes|-r|--contains|--merged|--no-merged|--points-at|--format|--sort|--abbrev|-v|-vv|--verbose)'; then
        return 0
    fi

    # πü¥πü«Σ╗ûπü»πâûπâ¡πââπé»∩╝êτá┤σúèτÜäµôìΣ╜£πÇüµû░ΦªÅπâûπâ⌐πâ│πâüΣ╜£µêÉτ¡ë∩╝ë
    return 1
}

# stdinπüïπéëJSONσàÑσè¢πéÆΦ¬¡πü┐σÅûπéè
json_input=$(cat)

# πâäπâ╝πâ½σÉìπéÆτó║Φ¬ì
tool_name=$(echo "$json_input" | jq -r '.tool_name // empty')

# Bashπâäπâ╝πâ½Σ╗Ñσñûπü»Φ¿▒σÅ»
if [ "$tool_name" != "Bash" ]; then
    exit 0
fi

# πé│πâ₧πâ│πâëπéÆσÅûσ╛ù
command=$(echo "$json_input" | jq -r '.tool_input.command // empty')

# µ╝öτ«ùσ¡ÉπüºΘÇúτ╡ÉπüòπéîπüƒσÉäπé│πâ₧πâ│πâëπéÆσÇïσêÑπü½πâüπéºπââπé»πüÖπéïπüƒπéüπü½σêåσë▓
# &&, ||, ;, |, |&, &, µö╣Φíîπü¬πü⌐πüºσî║σêçπüúπüªσàêΘá¡πâêπâ╝πé»πâ│πéÆσêñσ«ÜπüÖπéï
command_segments=$(printf '%s\n' "$command" | sed -E 's/\|&/\n/g; s/\|\|/\n/g; s/&&/\n/g; s/[;|&]/\n/g')

while IFS= read -r segment; do
    # πâ¬πâÇπéñπâ¼πé»πâêπéäheredocΣ╗ÑΘÖìπéÆΦÉ╜πü¿πüùπüªπâêπâ¬πâƒπâ│πé░
    trimmed_segment=$(echo "$segment" | sed 's/[<>].*//; s/<<.*//' | xargs)

    # τ⌐║Φíîπü»πé╣πé¡πââπâù
    if [ -z "$trimmed_segment" ]; then
        continue
    fi

    # πéñπâ│πé┐πâ⌐πé»πâåπéúπâûrebaseτªüµ¡ó (git rebase -i origin/main)
    if printf '%s' "$trimmed_segment" | grep -qE '^git[[:space:]]+rebase\b'; then
        if printf '%s' "$trimmed_segment" | grep -qE '(^|[[:space:]])(-i|--interactive)([[:space:]]|$)' &&
           printf '%s' "$trimmed_segment" | grep -qE '(^|[[:space:]])origin/main([[:space:]]|$)'; then
            cat <<EOF
{
  "decision": "block",
  "reason": "≡ƒÜ½ Interactive rebase against origin/main is not allowed",
  "stopReason": "Interactive rebase against origin/main initiated by LLMs is blocked because it frequently fails and disrupts sessions.\n\nBlocked command: $command"
}
EOF

            echo "≡ƒÜ½ Blocked: $command" >&2
            echo "Reason: Interactive rebase against origin/main is not allowed in Worktree." >&2
            exit 2
        fi
    fi

    # πâûπâ⌐πâ│πâüσêçπéèµ¢┐πüê/Σ╜£µêÉ/worktreeπé│πâ₧πâ│πâëπéÆπâüπéºπââπé»∩╝êπé¬πâùπé╖πâºπâ│Σ╗ÿπüìgitπé│πâ₧πâ│πâëπü½πééσ»╛σ┐£∩╝ë
    # git -C /path checkout, git --work-tree=/path checkout πü¬πü⌐πéÆµñ£σç║
    if echo "$trimmed_segment" | grep -qE '^git\b'; then
        # checkout/switchπü»τäíµ¥íΣ╗╢πâûπâ¡πââπé»
        if echo "$trimmed_segment" | grep -qE '\b(checkout|switch)\b'; then
            cat <<EOF
{
  "decision": "block",
  "reason": "≡ƒÜ½ Branch switching commands (checkout/switch) are not allowed",
  "stopReason": "Worktree is designed to complete work on the launched branch. Branch operations such as git checkout and git switch cannot be executed.\n\nBlocked command: $command"
}
EOF
            echo "≡ƒÜ½ Blocked: $command" >&2
            echo "Reason: Branch switching (checkout/switch) is not allowed in Worktree." >&2
            exit 2
        fi

        # branchπé╡πâûπé│πâ₧πâ│πâëπü»σÅéτàºτ│╗πü«πü┐Φ¿▒σÅ»
        # πâòπéíπéñπâ½σÉìπü½branchπéÆσÉ½πéÇσá┤σÉêπü»Φ¿▒σÅ»∩╝êΣ╛ï: git diff .claude/hooks/block-git-branch-ops.sh∩╝ë
        if echo "$trimmed_segment" | grep -qE '^git[[:space:]]+((-[a-zA-Z]|--[a-z-]+)[[:space:]]+)*branch\b'; then
            # git ... branch πü«σ╛îπü«σ╝òµò░πéÆµè╜σç║∩╝êbranchπéêπéèσëìπéÆσà¿πüªΘÖñσÄ╗∩╝ë
            branch_args=$(echo "$trimmed_segment" | sed -E 's/^git[[:space:]]+((-[a-zA-Z]|--[a-z-]+)[[:space:]]+)*branch//')
            if is_read_only_git_branch "$branch_args"; then
                continue
            fi
            # τá┤σúèτÜäµôìΣ╜£πéÆπâûπâ¡πââπé»
            cat <<EOF
{
  "decision": "block",
  "reason": "≡ƒÜ½ Branch modification commands are not allowed",
  "stopReason": "Worktree is designed to complete work on the launched branch. Destructive branch operations such as git branch -d, git branch -m cannot be executed.\n\nBlocked command: $command"
}
EOF
            echo "≡ƒÜ½ Blocked: $command" >&2
            echo "Reason: Branch modification is not allowed in Worktree." >&2
            exit 2
        fi

        # worktreeπé╡πâûπé│πâ₧πâ│πâëπéÆπâûπâ¡πââπé»∩╝êgit worktree add/removeτ¡ë∩╝ë
        # πâòπéíπéñπâ½σÉìπü½worktreeπéÆσÉ½πéÇσá┤σÉêπü»Φ¿▒σÅ»∩╝êΣ╛ï: git add src/worktree.ts∩╝ë
        if echo "$trimmed_segment" | grep -qE '^git[[:space:]]+((-[a-zA-Z]|--[a-z-]+)[[:space:]]+)*worktree\b'; then
            cat <<EOF
{
  "decision": "block",
  "reason": "≡ƒÜ½ Worktree commands are not allowed",
  "stopReason": "Worktree management operations such as git worktree add/remove cannot be executed from within a worktree.\n\nBlocked command: $command"
}
EOF
            echo "≡ƒÜ½ Blocked: $command" >&2
            echo "Reason: Worktree management is not allowed in Worktree." >&2
            exit 2
        fi
    fi
done <<< "$command_segments"

# Φ¿▒σÅ»
exit 0
