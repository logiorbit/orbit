import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { getAccessToken } from "../../auth/authService";
import {
  getMyEmployeeHierarchyRecord,
  getClients,
  getSkills,
  updateEmployeeHierarchy,
} from "../../services/sharePointService";

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
      CurrentClientId: form.currentClient,
      PrimarySkillsId: { results: form.primarySkills },
      SecondarySkillsId: { results: form.secondarySkills },
      PastClientsId: { results: form.pastClients },
      EndClients: form.endClients,
    });

    onSuccess();
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card premium-modal">
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="profile-form-grid">
            <div>
              <label>Employee</label>
              <input disabled value={record.Employee.Title} />
            </div>

            <div>
              <label>Employee Email</label>
              <input disabled value={record.Employee.EMail} />
            </div>

            <div>
              <label>Total Experience</label>
              <input
                type="number"
                step="0.1"
                value={form.totalExp}
                onChange={(e) => setForm({ ...form, totalExp: e.target.value })}
              />
            </div>

            <div>
              <label>Relevant Experience</label>
              <input
                type="number"
                step="0.1"
                value={form.relevantExp}
                onChange={(e) =>
                  setForm({ ...form, relevantExp: e.target.value })
                }
              />
            </div>

            <div>
              <label>Legal Name</label>
              <input
                value={form.legalName}
                onChange={(e) =>
                  setForm({ ...form, legalName: e.target.value })
                }
              />
            </div>

            <div>
              <label>Personal Email</label>
              <input
                type="email"
                value={form.personalEmail}
                onChange={(e) =>
                  setForm({ ...form, personalEmail: e.target.value })
                }
              />
            </div>

            <div>
              <label>Mobile</label>
              <input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </div>

            <div>
              <label>Current Client</label>
              <select
                value={form.currentClient}
                onChange={(e) =>
                  setForm({ ...form, currentClient: e.target.value })
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

            <div className="full-width">
              <label>Primary Skills</label>
              <select
                multiple
                value={form.primarySkills}
                onChange={(e) =>
                  setForm({
                    ...form,
                    primarySkills: Array.from(
                      e.target.selectedOptions,
                      (o) => +o.value
                    ),
                  })
                }
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

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={save}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
