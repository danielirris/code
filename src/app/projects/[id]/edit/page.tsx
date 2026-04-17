import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { updateProject, deleteProjectById } from "@/app/actions/projects";

export default async function EditProjectPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const project = await prisma.project.findUnique({ where: { id } });

  if (!project) return notFound();

  const experts = await prisma.expert.findMany({ orderBy: { name: 'asc' } });

  const updateProjectAction = updateProject.bind(null, id);

  async function deleteProject() {
    "use server";
    await deleteProjectById(id);
    redirect("/");
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link href={`/projects/${id}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          <ArrowLeft size={16} /> Back to Project
        </Link>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.8rem" }}>Edit Project</h1>
        <form action={deleteProject}>
          <button type="submit" className="btn-primary" style={{ background: "#fee2e2", color: "#ef4444", border: "1px solid #fca5a5" }}>
            <Trash2 size={16} style={{ display: "inline", marginRight: "0.5rem" }} /> Delete Project
          </button>
        </form>
      </div>

      <div className="bento-card" style={{ maxWidth: "800px" }}>
        <form action={updateProjectAction} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Project Name</label>
              <input type="text" name="name" className="input-base" defaultValue={project.name} required />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Client Name (Optional)</label>
              <input type="text" name="client" className="input-base" defaultValue={project.client || ""} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Assign Expert AI</label>
              <select name="expertId" className="input-base" defaultValue={project.expertId} required>
                {experts.map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.name} ({exp.specialty})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>Project Status</label>
              <select name="status" className="input-base" defaultValue={project.status} required>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "1rem" }}>
            <Link href={`/projects/${id}`} className="btn-primary" style={{ background: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
              Cancel
            </Link>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
