export async function run(context: ActionContext) {
  const result = {
    customerId: "abc123",
    name: "Jane Smith",
    tier: "premium",
    lastContact: "2024-02-20",
    openTickets: 2,
  };

  return result;
}

export const config = {
  id: "getCustomerInfo",
  metadata: { description: "Retrieves customer profile and status" },
  retries: 3,
  dependsOn: [],
};
