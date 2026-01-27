# TrustTrip GitHub Branching Guide

A comprehensive guide for team members on how to work with branches and pull requests in the TrustTrip project.

## Quick Start

### 1. Create a Feature Branch

```bash
# Pull the latest changes from main
git pull origin main

# Create a new branch following the naming convention
git checkout -b feature/your-feature-name

# Example: Working on refund calculator
git checkout -b feature/refund-calculator
```

### 2. Make Your Changes

```bash
# Make changes to your files
# Then stage and commit them

git add .
git commit -m "feat: add refund calculator with clear rules"

# If making multiple changes, use multiple commits
git commit -m "refactor: simplify refund calculation logic"
git commit -m "test: add tests for edge cases"
```

### 3. Push Your Branch

```bash
# Push your branch to the remote repository
git push origin feature/your-feature-name

# On first push, Git will suggest:
# git push --set-upstream origin feature/your-feature-name
```

### 4. Create a Pull Request

1. Go to GitHub: https://github.com/your-repo
2. Click "Pull requests" → "New pull request"
3. Select your branch and `main`
4. Fill out the PR template completely:
   - **Summary**: What does this PR do?
   - **Changes Made**: List the changes
   - **Screenshots**: Evidence of testing (if applicable)
   - **Testing**: How did you test?
   - **Checklist**: Verify all items are checked
5. Click "Create pull request"

### 5. Code Review & Merge

- Team members review your code
- Address any feedback by pushing new commits
- Once approved, click "Merge pull request"
- Delete the branch after merging

## Branching Strategy

### Branch Types

| Type | Purpose | Example |
|------|---------|---------|
| `feature/` | New features | `feature/login-auth` |
| `fix/` | Bug fixes | `fix/navbar-alignment` |
| `chore/` | Maintenance | `chore/update-dependencies` |
| `docs/` | Documentation | `docs/api-endpoint-guide` |

### Naming Conventions

✅ **Good Branch Names:**
- `feature/user-authentication`
- `fix/refund-calculation-bug`
- `docs/setup-instructions`
- `chore/upgrade-typescript`

❌ **Bad Branch Names:**
- `feature/fix-stuff` (too vague)
- `Feature/NewThing` (inconsistent casing)
- `feature-my-cool-thing` (wrong separator)

## Commit Message Format

Follow this format for clear commit history:

```
<type>: <subject>

<body>
```

### Types:
- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, semicolons, etc.)
- `refactor:` - Code refactoring without feature change
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, etc.

### Examples:

```bash
git commit -m "feat: add refund calculation logic"
git commit -m "fix: correct percentage calculation in refund"
git commit -m "docs: add API documentation"
git commit -m "refactor: simplify component structure"
```

## Common Workflows

### Scenario 1: Sync Your Branch with Main

When `main` has new commits and you need to update your branch:

```bash
# Option 1: Merge (preserves history)
git pull origin main

# Option 2: Rebase (cleaner history)
git rebase origin/main
```

### Scenario 2: Undo Last Commit (Before Pushing)

```bash
# Keep your changes
git reset --soft HEAD~1

# Discard your changes
git reset --hard HEAD~1
```

### Scenario 3: Update PR with New Changes

```bash
# Make your changes
git add .
git commit -m "refactor: address review feedback"

# Push the new commit
git push origin feature/your-feature-name

# GitHub automatically updates the PR
```

### Scenario 4: Delete a Local Branch

```bash
# After your PR is merged
git checkout main
git branch -d feature/your-feature-name
```

## Code Review Checklist

Before submitting your PR, verify:

- ✅ Feature works as expected
- ✅ No console errors or warnings
- ✅ Code follows naming conventions
- ✅ Comments are clear
- ✅ No hardcoded credentials
- ✅ Tests added/updated (if applicable)
- ✅ README updated (if necessary)
- ✅ Lint passes: `npm run lint`
- ✅ Build passes: `npm run build`

## Branch Protection Rules

The `main` branch has these protections:

1. **Pull Request Review Required**
   - At least 1 approval needed
   - Cannot bypass even for repository admins

2. **Status Checks Required**
   - All automated tests must pass
   - Lint checks must pass
   - Build must succeed

3. **No Direct Pushes**
   - All changes must go through PRs
   - Ensures code review for every change

4. **Branch Up to Date**
   - Branch must be updated with `main` before merge
   - Prevents merging stale code

## Troubleshooting

### "Permission denied (publickey)"

```bash
# SSH key not configured - add your SSH key to GitHub
# Go to Settings → SSH and GPG keys
```

### "Your branch has diverged"

```bash
# Your branch conflicts with main
git pull --rebase origin main

# Resolve conflicts, then:
git add .
git rebase --continue
git push --force-with-lease origin feature/your-feature-name
```

### "Can't delete branch - PR not merged"

```bash
# Merge the PR on GitHub first, or:
git branch -D feature/your-feature-name  # Force delete locally
```

## Best Practices

1. **Keep branches focused** - One feature per branch
2. **Keep branches short-lived** - Merge within a few days
3. **Communicate with your team** - Mention reviewers in PRs
4. **Test locally first** - Don't rely only on CI/CD
5. **Review your own code first** - Before requesting review
6. **Respond to feedback promptly** - Keep momentum going

## Need Help?

- Ask in Slack/Discord
- Check the main README.md
- Review completed PRs for examples
- Reach out to the team lead

---

**Happy coding! 🚀**
