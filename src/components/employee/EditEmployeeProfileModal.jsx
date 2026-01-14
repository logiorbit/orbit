import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getMyEmployeeHierarchyRecord,
  getClients,
  getSkills,
  updateEmployeeHierarchy,
} from "../../services/sharePointService";

import "./managerDashboard.css";

export default function EditEmployeeProfileModal({
  recordId,
  onClose,
  onSuccess,
}) {
  const { instance, accounts } = useMsal();

  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [clients, setClients] = useState([]);
  const [skills, setSkills] = useState([]);

  // ✅ Single, normalized form state
  const [form, setForm] = useState({
    employee: "",
    empemail: "",
    totalExp: "",
    relevantExp: "",
    legalName: "",
    personalEmail: "",
    mobile: "",
    currentClientId: "",
    primarySkillsIds: [],
    secondarySkillsIds: [],
    pastClientsIds: [],
    endClients: "",
  });

  // 🔹 Load data
  useEffect(() => {
    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const email = accounts[0].username;

      const data = await getMyEmployeeHierarchyRecord(token, email);
      setRecord(data);

      setForm({
        employee: data.Employee?.Title || "",
        empemail: data.Employee?.EMail || "",
        totalExp: data.TotalExp ?? "",
        relevantExp: data.RelevantExp ?? "",
        legalName: data.LegalName || "",
        personalEmail: data.PersonalEmail || "",
        mobile: data.Mobile || "",
        currentClientId: data.CurrentClient?.Id || "",
        primarySkillsIds: data.PrimarySkills?.map((s) => s.Id) || [],
        secondarySkillsIds: data.SecondarySkills?.map((s) => s.Id) || [],
        pastClientsIds: data.PastClients?.map((c) => c.Id) || [],
        endClients: data.EndClients || "",
      });

      setClients(await getClients(token));
      setSkills(await getSkills(token));
    }

    load();
  }, [instance, accounts]);

  if (!record) return null;

  // 🔹 Multi-select handlers
  const handlePrimarySkillsChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) =>
      Number(o.value)
    );
    setForm((prev) => ({ ...prev, primarySkillsIds: values }));
  };

  const handleSecondarySkillsChange = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) =>
      Number(o.value)
    );
    setForm((prev) => ({ ...prev, secondarySkillsIds: values }));
  };

  // 🔹 SAVE
  async function handleSave() {
    try {
      setLoading(true);
      const token = await getAccessToken(instance, accounts[0]);

      // ✅ Explicit mapping layer (THIS FIXES YOUR 400 ERRORS)
      const payload = {
        TotalExp: Number(form.totalExp),
        RelevantExp: Number(form.relevantExp),
        LegalName: form.legalName,
        PersonalEmail: form.personalEmail,
        Mobile: form.mobile,
        EndClients: form.endClients,
      };

      if (form.currentClientId) {
        payload.CurrentClientId = Number(form.currentClientId);
      }

      if (form.primarySkillsIds.length > 0) {
        payload.PrimarySkillsId = {
          results: form.primarySkillsIds.map(Number),
        };
      }

      if (form.secondarySkillsIds.length > 0) {
        payload.SecondarySkillsId = {
          results: form.secondarySkillsIds.map(Number),
        };
      }

      if (form.pastClientsIds.length > 0) {
        payload.PastClientsId = {
          results: form.pastClientsIds.map(Number),
        };
      }

      console.log("PATCH payload →", payload);

      await updateEmployeeHierarchy(token, record.Id, payload);

      onSuccess();
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card profile-modal">
        {/* Header */}
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="profile-form-grid">
            {/* READ ONLY */}
            <div className="form-group">
              <label>Employee</label>
              <input value={form.employee} disabled />
            </div>

            <div className="form-group">
              <label>Employee Email</label>
              <input value={form.empemail} disabled />
            </div>

            {/* EDITABLE */}
            <div className="form-group">
              <label>Total Experience (Years)</label>
              <input
                type="number"
                value={form.totalExp}
                onChange={(e) => setForm({ ...form, totalExp: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Relevant Experience (Years)</label>
              <input
                type="number"
                value={form.relevantExp}
                onChange={(e) =>
                  setForm({ ...form, relevantExp: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Legal Name</label>
              <input
                value={form.legalName}
                onChange={(e) =>
                  setForm({ ...form, legalName: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Personal Email</label>
              <input
                value={form.personalEmail}
                onChange={(e) =>
                  setForm({ ...form, personalEmail: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Mobile</label>
              <input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Current Client</label>
              <select
                value={form.currentClientId}
                onChange={(e) =>
                  setForm({ ...form, currentClientId: e.target.value })
                }
              >
                <option value="">Select</option>
                {clients.map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Title}
                  </option>
                ))}
              </select>
            </div>

            {/* MULTI SELECT */}
            <div className="form-group full-width">
              <label>Primary Skills</label>
              <select
                multiple
                value={form.primarySkillsIds}
                onChange={handlePrimarySkillsChange}
              >
                {skills.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group full-width">
              <label>Secondary Skills</label>
              <select
                multiple
                value={form.secondarySkillsIds}
                onChange={handleSecondarySkillsChange}
              >
                {skills.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
