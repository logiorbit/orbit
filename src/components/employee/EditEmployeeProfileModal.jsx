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

export default function EditEmployeeProfileModal({ onClose, onSuccess }) {
  const { instance, accounts } = useMsal();
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

  async function save() {
    const token = await getAccessToken(instance, accounts[0]);

    await updateEmployeeHierarchy(token, record.Id, {
      TotalExp: Number(form.totalExp),
      RelevantExp: Number(form.relevantExp),
      LegalName: form.legalName,
      PersonalEmail: form.personalEmail,
      Mobile: form.mobile,
      CurrentClient: form.currentClient,
      PrimarySkills: { results: form.primarySkills },
      SecondarySkills: { results: form.secondarySkills },
      PastClients: { results: form.pastClients },
      EndClients: form.endClients,
    });

    onSuccess();
    onClose();
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
                value={form.TotalExp}
                onChange={(e) => setForm({ ...form, TotalExp: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Relevant Experience (Years)</label>
              <input
                type="number"
                value={form.RelevantExp}
                onChange={(e) =>
                  setForm({ ...form, RelevantExp: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Legal Name</label>
              <input
                value={form.LegalName}
                onChange={(e) =>
                  setForm({ ...form, LegalName: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Personal Email</label>
              <input
                value={form.PersonalEmail}
                onChange={(e) =>
                  setForm({ ...form, PersonalEmail: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Mobile</label>
              <input
                type="tel"
                value={form.Mobile}
                onChange={(e) => setForm({ ...form, Mobile: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Current Client</label>
              <select
                value={form.CurrentClientId}
                onChange={(e) =>
                  setForm({ ...form, CurrentClientId: e.target.value })
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
                value={form.PrimarySkills}
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
                value={form.SecondarySkills}
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
