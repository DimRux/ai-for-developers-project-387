# Contributing to Booking Calendar

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only changes |
| `style` | Code style changes (formatting, missing semi-colons, etc.) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `build` | Changes to build system or external dependencies |
| `ci` | Changes to CI configuration files and scripts |
| `chore` | Other changes that don't modify src or test files |
| `revert` | Revert a previous commit |

### Scopes

Use the workspace name as scope:

- `back` — backend (NestJS)
- `front` — frontend (React)
- `spec` — API contract (TypeSpec)
- `ci` — CI/CD workflows
- `deps` — dependency updates

### Examples

```
feat(back): add global occupancy check for slots
fix(front): correct slot timezone rendering in calendar
docs: add user scenarios for booking flow
test(back): add integration tests for booking creation
ci: add Playwright E2E workflow
chore(deps): update NestJS to v11
```

### Breaking Changes

Add `!` after the type/scope or include `BREAKING CHANGE:` in the footer:

```
feat(back)!: change booking API response shape

BREAKING CHANGE: guest field is now a nested object instead of separate fields
```

### Rules

- Use imperative mood in the description ("add feature" not "added feature")
- Do not capitalize the first letter of the description
- Do not end the description with a period
- Keep the description under 72 characters
- One logical change per commit
- Use the workspace scope for changes within a specific workspace
