#!/bin/bash

# Claude Code PreToolUse Hook: Block cd command outside worktree
# πüôπü«πé╣πé»πâ¬πâùπâêπü» Worktree πâçπéúπâ¼πé»πâêπâ¬σñûπü╕πü« cd πé│πâ₧πâ│πâëπéÆπâûπâ¡πââπé»πüùπü╛πüÖ

# Worktreeπü«πâ½πâ╝πâêπâçπéúπâ¼πé»πâêπâ¬πéÆσÅûσ╛ù
WORKTREE_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$WORKTREE_ROOT" ]; then
    # gitπâ¬πâ¥πé╕πâêπâ¬πüºπü¬πüäσá┤σÉêπü»τÅ╛σ£¿πü«πâçπéúπâ¼πé»πâêπâ¬πéÆΣ╜┐τö¿
    WORKTREE_ROOT=$(pwd)
fi

# πâæπé╣πüî Worktree ΘàìΣ╕ïπüïπü⌐πüåπüïπéÆσêñσ«Ü
is_within_worktree() {
    local target_path="$1"

    # τ⌐║πü«πâæπé╣πü»πâ¢πâ╝πâáπâçπéúπâ¼πé»πâêπâ¬πü¿πü┐πü¬πüÖ
    if [ -z "$target_path" ] || [ "$target_path" = "~" ]; then
        return 1  # πâ¢πâ╝πâáπâçπéúπâ¼πé»πâêπâ¬πü»Worktreeσñû
    fi

    # τ¢╕σ»╛πâæπé╣πéÆτ╡╢σ»╛πâæπé╣πü½σñëµÅ¢∩╝êrealpathπüîπü¬πüäτÆ░σóâπéÆΦÇâµà«∩╝ë
    if [[ "$target_path" = /* ]]; then
        # τ╡╢σ»╛πâæπé╣πü«σá┤σÉêπü»πü¥πü«πü╛πü╛
        local abs_path="$target_path"
    else
        # τ¢╕σ»╛πâæπé╣πü«σá┤σÉêπü»τÅ╛σ£¿πü«πâçπéúπâ¼πé»πâêπâ¬σƒ║µ║ûπüºΦºúµ▒║
        local abs_path
        abs_path=$(cd -- "$target_path" 2>/dev/null && pwd)
        if [ -z "$abs_path" ]; then
            # πâçπéúπâ¼πé»πâêπâ¬πüîσ¡ÿσ£¿πüùπü¬πüäσá┤σÉêπü»τÅ╛σ£¿πü«πâçπéúπâ¼πé»πâêπâ¬πüïπéëπü«τ¢╕σ»╛πâæπé╣πü¿πüùπüªΦ¿êτ«ù
            abs_path="$(pwd)/$target_path"
        fi
    fi

    # πé╖πâ│πâ£πâ¬πââπé»πâ¬πâ│πé»πéÆΦºúµ▒║πüùπüªµ¡úΦªÅσîû
    if command -v realpath >/dev/null 2>&1; then
        local resolved_path
        resolved_path=$(realpath -m "$abs_path" 2>/dev/null) && abs_path="$resolved_path"
    fi

    # Worktreeπâ½πâ╝πâêπü«πâùπâ¼πâòπéúπââπé»πé╣πâüπéºπââπé»
    case "$abs_path" in
        "$WORKTREE_ROOT"|"$WORKTREE_ROOT"/*)
            return 0  # WorktreeΘàìΣ╕ï
            ;;
        *)
            return 1  # Worktreeσñû
            ;;
    esac
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

    # cdπé│πâ₧πâ│πâëπéÆπâüπéºπââπé»∩╝êcdπÇübuiltin cdπÇücommand cdπü¬πü⌐∩╝ë
    if echo "$trimmed_segment" | grep -qE '^(builtin[[:space:]]+)?(command[[:space:]]+)?cd\b'; then
        # cd πü«πé┐πâ╝πé▓πââπâêπâæπé╣πéÆµè╜σç║
        target_path=$(echo "$trimmed_segment" | sed -E 's/^(builtin[[:space:]]+)?(command[[:space:]]+)?cd[[:space:]]+//' | awk '{print $1}')

        # πé┐πâ╝πé▓πââπâêπâæπé╣πüîWorktreeΘàìΣ╕ïπüïπâüπéºπââπé»
        if ! is_within_worktree "$target_path"; then
            # JSONσ┐£τ¡öπéÆΦ┐öπüÖ
            cat <<EOF
{
  "decision": "block",
  "reason": "≡ƒÜ½ cd command outside worktree is not allowed",
  "stopReason": "Worktree is designed to complete work within the launched directory. Directory navigation outside the worktree using cd command cannot be executed.\n\nWorktree root: $WORKTREE_ROOT\nTarget path: $target_path\nBlocked command: $command\n\nInstead, use absolute paths to execute commands, e.g., 'git -C /path/to/repo status' or '/path/to/script.sh'"
}
EOF

            # stderrπü½πééπâíπââπé╗πâ╝πé╕πéÆσç║σè¢
            echo "≡ƒÜ½ Blocked: $command" >&2
            echo "Reason: Navigation outside worktree ($target_path) is not allowed." >&2
            echo "Worktree root: $WORKTREE_ROOT" >&2

            exit 2  # πâûπâ¡πââπé»
        fi
    fi
done <<< "$command_segments"

# Φ¿▒σÅ»
exit 0
