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
  const [form, setForm] = useState({});

  useEffect(() => {
    async function load() {
      const token = await getAccessToken(instance, accounts[0]);
      const email = accounts[0].username;

      const data = await getMyEmployeeHierarchyRecord(token, email);
      setRecord(data);

      setForm({
        employee: data.Employee.Title || "",
        empemail: data.Employee.EMail || "",
        totalExp: data.TotalExp || "",
        relevantExp: data.RelevantExp || "",
        legalName: data.LegalName || "",
        personalEmail: data.PersonalEmail || "",
        mobile: data.Mobile || "",
        primarySkills: data.PrimarySkills?.map((s) => s.Id) || [],
        secondarySkills: data.SecondarySkills?.map((s) => s.Id) || [],
        currentClient: data.CurrentClient?.Id || "",
        pastClients: data.PastClients?.map((c) => c.Id) || [],
        endClients: data.EndClients || "",
      });

      setClients(await getClients(token));
      setSkills(await getSkills(token));
    }

    load();
  }, []);

  if (!record) return null;

  function handlePrimarySkillsChange(e) {
    const values = Array.from(e.target.selectedOptions).map((o) =>
      Number(o.value)
    );
    setForm((prev) => ({ ...prev, primarySkills: values }));
  }

  function handleSecondarySkillsChange(e) {
    const values = Array.from(e.target.selectedOptions).map((o) =>
      Number(o.value)
    );
    setForm((prev) => ({ ...prev, secondarySkills: values }));
  }

  async function handleSave() {
    try {
      setLoading(true);
      const token = await getAccessToken(instance, accounts[0]);

      const payload = {};

      // 🔹 Numbers
      if (form.totalExp !== "") {
        payload.TotalExp = Number(form.totalExp);
      }

      if (form.relevantExp !== "") {
        payload.RelevantExp = Number(form.relevantExp);
      }

      // 🔹 Text
      if (form.legalName) payload.LegalName = form.legalName;
      if (form.personalEmail) payload.PersonalEmail = form.personalEmail;
      if (form.mobile) payload.Mobile = form.mobile;

      // 🔹 Single lookup
      if (form.currentClient) {
        payload.currentClientIds = Number(form.currentClient);
      }

      // 🔹 Multi lookups (ONLY if array has values)
      if (form.primarySkills?.length > 0) {
        payload.primarySkillsIds = { results: form.primarySkills };
      }

      if (form.secondarySkills?.length > 0) {
        payload.secondarySkillsIds = { results: form.secondarySkills };
      }

      if (form.pastClients?.length > 0) {
        payload.pastClientsIds = { results: form.pastClients };
      }

      // 🔹 Single line text
      if (form.endClients) {
        payload.EndClients = form.endClients;
      }

      console.log("PATCH payload →", payload);

      await updateEmployeeHierarchy(token, record.Id, payload);

      onSuccess();
      onClose();
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
                type="tel"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Current Client</label>
              <select
                value={form.currentClient}
                onChange={(e) =>
                  setForm({ ...form, currentClient: e.target.value })
                }
              >
                {clients.map((c) => (
                  <option key={c.Id} value={c.Id}>
                    {c.Title}
                  </option>
                ))}
              </select>
            </div>

            {/* MULTI SELECT – FULL WIDTH */}
            <div className="form-group full-width">
              <label>Primary Skills</label>
              <select
                multiple
                value={form.primarySkills}
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
                value={form.secondarySkills}
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
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
