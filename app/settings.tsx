import { getDeviceId, getLastSyncAt } from "@/src/storage/kv";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Divider, Text } from "react-native-paper";
import { syncNow } from "../src/domain/sync";

export default function SettingsScreen() {
  const [deviceId, setDeviceId] = useState<string>("");
  const [lastSync, setLastSync] = useState<string | null>(null);

  //Cargar valores asincrónicos al montar
  useEffect(() => {
    async function loadData() {
      const id = await getDeviceId();
      const syncAt = await getLastSyncAt();

      setDeviceId(id);
      setLastSync(syncAt);
    }

    loadData();
  }, []);

  async function handleSync() {
    await syncNow();
    const syncAt = await getLastSyncAt();
    setLastSync(syncAt);
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text variant="titleMedium">Ajustes y Debug</Text>
      <Divider />

      <Text variant="bodyMedium">Device ID:</Text>
      <Text style={{ color: "purple" }}>{deviceId}</Text>

      <Text variant="bodyMedium">Última sincronización:</Text>
      <Text>{lastSync ?? "Nunca"}</Text>

      <Button icon="sync" mode="contained" onPress={handleSync}>
        Forzar Sync
      </Button>
    </View>
  );
}
