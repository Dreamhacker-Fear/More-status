import { React } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";
import { StatusRotatorAPI } from "./index";

const { FormSection, FormRow, FormSwitchRow, FormInput, FormDivider } = Forms;

export default function Settings() {
    const [settings, setSettings] = React.useState(StatusRotatorAPI.getSettings());
    const [newStatus, setNewStatus] = React.useState("");

    const update = (patch) => {
        const merged = { ...settings, ...patch };
        setSettings(merged);
        StatusRotatorAPI.save(merged);
    };

    const addStatus = () => {
        if (!newStatus.trim()) return;
        update({ statuses: [...settings.statuses, { text: newStatus.trim() }] });
        setNewStatus("");
    };

    const removeStatus = (idx) => {
        update({ statuses: settings.statuses.filter((_, i) => i !== idx) });
    };

    return (
        <Forms.FormScrollView>
            <FormSection title="General">
                <FormSwitchRow
                    label="Enabled"
                    value={settings.enabled}
                    onValueChange={(v) => update({ enabled: v })}
                />
                <FormDivider />
                <FormInput
                    title="Interval (minutes)"
                    value={String(settings.intervalMinutes)}
                    onChange={(v) => update({ intervalMinutes: parseInt(v) || 1 })}
                    keyboardType="numeric"
                />
                <FormDivider />
                <FormSwitchRow
                    label="Random order"
                    value={settings.randomOrder}
                    onValueChange={(v) => update({ randomOrder: v })}
                />
            </FormSection>

            <FormSection title="Statuses">
                {settings.statuses.map((s, i) => (
                    <FormRow
                        key={i}
                        label={s.text}
                        onPress={() => removeStatus(i)}
                        trailing={FormRow.Arrow}
                    />
                ))}
                <FormDivider />
                <FormInput
                    title="New status text"
                    value={newStatus}
                    onChange={setNewStatus}
                    placeholder="e.g. taking a break"
                />
                <FormRow
                    label="Add status"
                    onPress={addStatus}
                />
            </FormSection>
        </Forms.FormScrollView>
    );
}
