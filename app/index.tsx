import { Link, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Button, Card, Snackbar, Text } from "react-native-paper";
import { getAllObservations } from "../src/domain/repo";
import { syncNow } from "../src/domain/sync";

export default function HomeScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    const data = await getAllObservations();
    setItems(data);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  async function handleSync() {
    setSyncing(true);
    const res = await syncNow();
    setSyncing(false);
    setMsg(`Sync OK (${res.changes} cambios)`);
    load();
  }

  return (
    <View style={{ flex: 1, padding: 12, gap: 8 }}>
      <Button
        mode="contained-tonal"
        onPress={handleSync}
        loading={syncing}
        icon="sync"
      >
        Sincronizar
      </Button>

      <Link href="/new" asChild>
  <Button mode="contained" icon="plus">
    Nueva observación
  </Button>
</Link>

      {items.length === 0 && <Text style={{ marginTop: 20 }}>📭 No hay registros</Text>}

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshControl={
          <RefreshControl refreshing={syncing} onRefresh={handleSync} />
        }
        renderItem={({ item }) => (
          <Card style={{ marginVertical: 6 }}>
            <Card.Title title={item.title} subtitle={`Severidad: ${item.severity}`} />
            <Card.Content>
              <Text>{item.description}</Text>
              <Text style={{ fontSize: 12, color: "#777" }}>
                {item.updatedAt}
              </Text>
            </Card.Content>
          </Card>
        )}
      />

      <Snackbar visible={!!msg} onDismiss={() => setMsg("")} duration={2500}>
        {msg}
      </Snackbar>
    </View>
  );
}
