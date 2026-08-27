import { React } from "@vendetta/metro/common";
import { General } from "@vendetta/ui/components";
import { StatusRotatorAPI } from "./index";

const { ScrollView, Text, TextInput, Switch, Button } = General;

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
        <ScrollView>
            <Text>Enabled</Text>
            <Switch value={settings.enabled} onValueChange={(v) => update({ enabled: v })} />

            <Text>Interval (minutes)</Text>
            <TextInput
                value={String(settings.intervalMinutes)}
                onChangeText={(v) => update({ intervalMinutes: parseInt(v) || 1 })}
                keyboardType="numeric"
            />

            <Text>Random order</Text>
            <Switch value={settings.randomOrder} onValueChange={(v) => update({ randomOrder: v })} />

            <Text>Statuses</Text>
            {settings.statuses.map((s, i) => (
                <Text key={i} onPress={() => removeStatus(i)}>
                    {s.text}
                </Text>
            ))}

            <TextInput
                placeholder="New status text"
                value={newStatus}
                onChangeText={setNewStatus}
            />
            <Button title="Add status" onPress={addStatus} />
        </ScrollView>
    );
}
