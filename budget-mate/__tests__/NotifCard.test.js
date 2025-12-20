import { render, waitFor } from "@testing-library/react-native";
import NotifCard from "../components/ui/NotifCard";

const mockItem = {
  notificationId: "notif-123",
  taskTitle: "Task Reminder",
  body: "Set reminder for specific task",
  scheduledAt: new Date("2025-12-15T00:00:00Z"),
};

describe("NotifCard Snapshot", () => {
  it("renders correctly notification data", async () => {
    const { toJSON } = render(
      <NotifCard item={mockItem} cancel={jest.fn()} />
    );

    await waitFor(() => {
      expect(toJSON()).toMatchSnapshot();
    });
  });
});