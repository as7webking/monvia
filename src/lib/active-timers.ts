interface RpcLikeClient {
  rpc: (fn: string, args?: Record<string, unknown>) => any
}

export async function callStopActiveTimer(client: RpcLikeClient, timerId: string) {
  const { error } = await client.rpc('stop_active_timer', { p_user_id: timerId })
  if (error) {
    throw error
  }
}
