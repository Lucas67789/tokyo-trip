<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 💻 Developer Environment & Deployment Guidelines
- **Git Tool**: The AI agent should handle all version control tasks automatically using Git command-line tools (`git add`, `git commit`, `git push`) unless otherwise specified by the developer.
- **Deployment**: The developer uses Git-based automatic deployment (e.g., Vercel, Netlify). Do not make assumptions about `localhost:3000` or local dev environments unless asked.
- **Workflow**: Ensure that the code changes are completely and cleanly written to the files, and then automatically commit and push the changes directly to the remote repository.

