# GitHub Workflow & Repository Setup

Complete guide for setting up GitHub repository, workflows, and maintaining context throughout development.

## Repository Structure

```
vpn-client-app/
├── .github/
│   ├── workflows/           # GitHub Actions
│   │   ├── ci.yml          # Continuous Integration
│   │   ├── release.yml     # Release automation
│   │   └── security.yml    # Security scanning
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── config.yml
│   └── pull_request_template.md
├── backend/                 # Go backend service
├── gui/                     # Electron GUI app
├── docs/                    # Documentation
├── scripts/                 # Build and utility scripts
├── .gitignore
├── LICENSE
└── README.md
```

## Initial Repository Setup

### Step 1: Create Repository

```bash
# Create new repository on GitHub (via web interface)
# Then clone locally
git clone git@github.com:yourusername/vpn-client-app.git
cd vpn-client-app

# Initialize with main branch
git branch -M main
git push -u origin main
```

### Step 2: Configure Repository Settings

**On GitHub web interface:**

1. **Settings → General**
   - Description: "Cross-platform VPN client with WireGuard and OpenVPN support"
   - Website: (your documentation site if any)
   - Topics: `vpn`, `wireguard`, `openvpn`, `electron`, `golang`, `macos`, `cross-platform`
   - Disable: Wiki, Projects (if not needed)
   - Enable: Issues, Discussions

2. **Settings → Branches**
   - Default branch: `main`
   - Branch protection rules for `main`:
     - ✅ Require pull request before merging
     - ✅ Require approvals (1)
     - ✅ Require status checks to pass
     - ✅ Require conversation resolution
     - ✅ Do not allow bypassing the above settings

3. **Settings → Code security and analysis**
   - ✅ Enable Dependabot alerts
   - ✅ Enable Dependabot security updates
   - ✅ Enable Secret scanning

## Branch Strategy

### Main Branches

- `main` - Production-ready code, always stable
- `develop` - Integration branch for features (optional, for larger teams)

### Feature Branches

**Naming Convention:**
```
feature/<feature-name>       # New features
bugfix/<issue-number>-<description>  # Bug fixes
hotfix/<issue-number>-<description>  # Critical fixes
docs/<what-to-document>      # Documentation updates
refactor/<what-to-refactor>  # Code refactoring
```

**Examples:**
```
feature/wireguard-integration
bugfix/123-connection-timeout
hotfix/456-critical-security-fix
docs/api-documentation
refactor/connection-manager
```

### Workflow

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feature/profile-import

# Work on feature, commit frequently
git add .
git commit -m "feat: add profile import parser"

# Push to remote
git push -u origin feature/profile-import

# Create Pull Request on GitHub
# After review and approval, merge via GitHub UI
# Delete branch after merge
```

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring (neither fixes a bug nor adds a feature)
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependency updates, build configs, etc.)
- `ci`: CI/CD configuration changes
- `build`: Build system changes

### Examples

```bash
# Feature
git commit -m "feat(profiles): add WireGuard config parser"

# Bug fix
git commit -m "fix(connection): resolve timeout on slow networks"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Breaking change
git commit -m "feat(api)!: change profile endpoint structure

BREAKING CHANGE: Profile API now returns nested object instead of flat structure"

# With body and footer
git commit -m "fix(gui): prevent crash on profile deletion

The app would crash when deleting the currently active profile.
Now we check if profile is active before allowing deletion.

Closes #123"
```

### Scope Examples

- `profiles` - Profile management
- `connection` - Connection handling
- `gui` - User interface
- `backend` - Backend service
- `network` - Network configuration
- `platform` - Platform-specific code
- `api` - API layer
- `docs` - Documentation
- `ci` - CI/CD

## Pull Request Process

### Creating a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature
   ```

2. **Create PR on GitHub**
   - Use descriptive title (follows commit convention)
   - Fill out PR template completely
   - Link related issues using keywords:
     - `Closes #123` (for features/fixes)
     - `Relates to #456` (for related work)
     - `Part of #789` (for partial implementation)

3. **PR Title Format**
   ```
   feat(profiles): add WireGuard config parser
   fix(connection): resolve timeout on slow networks
   docs: update API documentation
   ```

### PR Template

Location: `.github/pull_request_template.md`

```markdown
## Description
<!-- Describe your changes in detail -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Related Issues
<!-- Link related issues: Closes #123, Relates to #456 -->

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Tested on macOS
- [ ] Tested on Windows
- [ ] Tested on Linux

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

## Additional Notes
<!-- Any additional information -->
```

### Code Review Checklist

**Reviewers should verify:**

- [ ] Code follows project conventions
- [ ] Commit messages follow convention
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact is acceptable
- [ ] Changes are backwards compatible (or breaking changes are documented)
- [ ] All conversations are resolved

## GitHub Actions CI/CD

### CI Workflow

Location: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-test:
    name: Backend Tests
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        go-version: [1.21]
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: ${{ matrix.go-version }}
      
      - name: Run tests
        working-directory: ./backend
        run: |
          go test -v -race -coverprofile=coverage.out ./...
          go tool cover -html=coverage.out -o coverage.html
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage.out
  
  frontend-test:
    name: Frontend Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: ./gui/package-lock.json
      
      - name: Install dependencies
        working-directory: ./gui
        run: npm ci
      
      - name: Run linter
        working-directory: ./gui
        run: npm run lint
      
      - name: Run tests
        working-directory: ./gui
        run: npm test -- --coverage
      
      - name: Build
        working-directory: ./gui
        run: npm run build

  security-scan:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

### Release Workflow

Location: `.github/workflows/release.yml`

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  build:
    name: Build ${{ matrix.os }}
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        include:
          - os: macos-latest
            artifact: macos
          - os: windows-latest
            artifact: windows
          - os: ubuntu-latest
            artifact: linux
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: 1.21
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build Backend
        working-directory: ./backend
        run: |
          go build -o vpn-service ./cmd/vpn-service
      
      - name: Build Frontend
        working-directory: ./gui
        run: |
          npm ci
          npm run build
          npm run package
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: vpn-client-${{ matrix.artifact }}
          path: |
            gui/dist/*.dmg
            gui/dist/*.exe
            gui/dist/*.AppImage
  
  release:
    name: Create Release
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Download artifacts
        uses: actions/download-artifact@v3
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            vpn-client-macos/*.dmg
            vpn-client-windows/*.exe
            vpn-client-linux/*.AppImage
          draft: true
          generate_release_notes: true
```

## Issue Templates

### Bug Report

Location: `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. macOS 14.1]
 - App Version: [e.g. 1.0.0]
 - VPN Protocol: [e.g. WireGuard]

**Logs**
Please attach relevant logs from the app.

**Additional context**
Add any other context about the problem here.
```

### Feature Request

Location: `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Project Management

### Using GitHub Projects

1. **Create Project Board**
   - Name: "VPN Client Development"
   - Template: "Automated kanban with reviews"

2. **Columns:**
   - 📋 Backlog
   - 🔜 Todo
   - 🏗 In Progress
   - 👀 In Review
   - ✅ Done

3. **Automation:**
   - New issues → Backlog
   - PR opened → In Progress
   - PR review requested → In Review
   - PR merged → Done

### Using Milestones

Create milestones for major releases:

- **v0.1.0 - MVP** (12 weeks)
  - Basic connection functionality
  - Profile management
  - Simple UI

- **v0.2.0 - Beta** (8 weeks)
  - Kill switch
  - Split tunneling
  - Enhanced UI

- **v1.0.0 - Release** (4 weeks)
  - Production ready
  - Full documentation
  - Installers for all platforms

## Maintaining Context

### Documentation Practices

1. **Keep README Updated**
   - Project description
   - Quick start guide
   - Build instructions
   - Contribution guidelines

2. **Document Architecture Decisions**
   - Create ADR (Architecture Decision Records) in `docs/adr/`
   - Format: `001-wireguard-over-openvpn.md`

3. **Code Comments**
   - Explain "why", not "what"
   - Document complex algorithms
   - Add TODOs with issue numbers

4. **Changelog**
   - Maintain `CHANGELOG.md`
   - Follow [Keep a Changelog](https://keepachangelog.com/) format
   - Update with each PR

### Communication

1. **PR Descriptions**
   - Detailed explanation of changes
   - Context for reviewers
   - Link to related discussions

2. **Issue Discussions**
   - Use issues for feature discussions
   - Tag relevant people
   - Keep conversations focused

3. **GitHub Discussions**
   - Q&A section
   - Feature proposals
   - General discussions

### Knowledge Base

Create a Wiki or use `docs/` folder for:

- Development setup guide
- Testing guide
- Release process
- Common issues and solutions
- Coding standards
- API documentation

## Security Best Practices

1. **Never Commit Secrets**
   - Use `.gitignore` for sensitive files
   - Use GitHub Secrets for CI/CD
   - Scan for exposed secrets (use git-secrets)

2. **Code Signing Certificates**
   - Store in GitHub Secrets
   - Never commit to repository
   - Rotate regularly

3. **Dependency Management**
   - Regular dependency updates
   - Review security advisories
   - Use Dependabot

## Backup & Recovery

1. **Regular Backups**
   - GitHub automatically backs up your code
   - Keep local clones on multiple machines
   - Consider GitHub repository backup service

2. **Tag Important Points**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

3. **Document Recovery Procedures**
   - How to restore from backup
   - How to roll back releases
   - Emergency contact information

## Next Steps

1. [ ] Create GitHub repository
2. [ ] Set up branch protection
3. [ ] Configure GitHub Actions
4. [ ] Create issue templates
5. [ ] Set up project board
6. [ ] Create initial milestones
7. [ ] Invite team members (if any)
8. [ ] Push initial commit
