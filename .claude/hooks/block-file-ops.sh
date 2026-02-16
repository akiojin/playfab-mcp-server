#!/bin/bash

# Claude Code PreToolUse Hook: Block file operations outside worktree
# πüôπü«πé╣πé»πâ¬πâùπâêπü» Worktree πâçπéúπâ¼πé»πâêπâ¬σñûπü╕πü«πâòπéíπéñπâ½µôìΣ╜£πéÆπâûπâ¡πââπé»πüùπü╛πüÖ

# Worktreeπü«πâ½πâ╝πâêπâçπéúπâ¼πé»πâêπâ¬πéÆσÅûσ╛ù
WORKTREE_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$WORKTREE_ROOT" ]; then
    # gitπâ¬πâ¥πé╕πâêπâ¬πüºπü¬πüäσá┤σÉêπü»τÅ╛σ£¿πü«πâçπéúπâ¼πé»πâêπâ¬πéÆΣ╜┐τö¿
    WORKTREE_ROOT=$(pwd)
fi

# πâæπé╣πüî Worktree ΘàìΣ╕ïπüïπü⌐πüåπüïπéÆσêñσ«Ü
is_within_worktree() {
    local target_path="$1"

    # τ⌐║πü«πâæπé╣πü»Worktreeσñûπü¿πü┐πü¬πüÖ
    if [ -z "$target_path" ]; then
        return 1
    fi

    # πâ¢πâ╝πâáπâçπéúπâ¼πé»πâêπâ¬πü»Worktreeσñû
    if [ "$target_path" = "~" ]; then
        return 1
    fi

    # τ¢╕σ»╛πâæπé╣πéÆτ╡╢σ»╛πâæπé╣πü½σñëµÅ¢
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

# πé│πâ₧πâ│πâëπüïπéëσà¿πüªπü«πâæπé╣σ╝òµò░πéÆµè╜σç║
extract_file_paths() {
    local cmd="$1"

    # Python3πüîσê⌐τö¿σÅ»Φâ╜πü¬σá┤σÉêπü»shlexπéÆΣ╜┐τö¿
    if command -v python3 >/dev/null 2>&1; then
        python3 -c "
import sys
import shlex

cmd = '''$cmd'''
try:
    tokens = shlex.split(cmd)
    # µ£Çσê¥πü«πâêπâ╝πé»πâ│(πé│πâ₧πâ│πâëσÉì)πéÆπé╣πé¡πââπâùπüùπÇüπé¬πâùπé╖πâºπâ│(-πüºσºïπü╛πéï)Σ╗ÑσñûπéÆµè╜σç║
    paths = [t for t in tokens[1:] if not t.startswith('-')]
    for p in paths:
        print(p)
except:
    pass
" 2>/dev/null
    else
        # πâòπé⌐πâ╝πâ½πâÉπââπé»: awkπüºσ╝òµò░πéÆµè╜σç║
        echo "$cmd" | awk '{for(i=2;i<=NF;i++) if($i !~ /^-/) print $i}'
    fi
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
command_segments=$(printf '%s\n' "$command" | sed -E 's/\|&/\n/g; s/\|\|/\n/g; s/&&/\n/g; s/[;|&]/\n/g')

while IFS= read -r segment; do
    # πâ¬πâÇπéñπâ¼πé»πâêπéäheredocΣ╗ÑΘÖìπéÆΦÉ╜πü¿πüùπüªπâêπâ¬πâƒπâ│πé░
    trimmed_segment=$(echo "$segment" | sed 's/[<>].*//; s/<<.*//' | xargs)

    # τ⌐║Φíîπü»πé╣πé¡πââπâù
    if [ -z "$trimmed_segment" ]; then
        continue
    fi

    # πâòπéíπéñπâ½µôìΣ╜£πé│πâ₧πâ│πâëπéÆπâüπéºπââπé»
    if echo "$trimmed_segment" | grep -qE '^(mkdir|rmdir|rm|touch|cp|mv)\b'; then
        # πâæπé╣σ╝òµò░πéÆµè╜σç║
        file_paths=$(extract_file_paths "$trimmed_segment")

        # σÉäπâæπé╣πüîWorktreeΘàìΣ╕ïπüïπâüπéºπââπé»
        while IFS= read -r path; do
            if [ -z "$path" ]; then
                continue
            fi

            if ! is_within_worktree "$path"; then
                # JSONσ┐£τ¡öπéÆΦ┐öπüÖ
                cat <<EOF
{
  "decision": "block",
  "reason": "≡ƒÜ½ File operations outside worktree are not allowed",
  "stopReason": "Worktree is designed to complete work within the launched directory. File operations outside the worktree cannot be executed.\n\nWorktree root: $WORKTREE_ROOT\nTarget path: $path\nBlocked command: $command\n\nInstead, use absolute paths within worktree, e.g., 'mkdir ./new-dir' or 'rm ./file.txt'"
}
EOF

                # stderrπü½πééπâíπââπé╗πâ╝πé╕πéÆσç║σè¢
                echo "≡ƒÜ½ Blocked: $command" >&2
                echo "Reason: File operation outside worktree ($path) is not allowed." >&2
                echo "Worktree root: $WORKTREE_ROOT" >&2

                exit 2  # πâûπâ¡πââπé»
            fi
        done <<< "$file_paths"
    fi
done <<< "$command_segments"

# Φ¿▒σÅ»
exit 0
