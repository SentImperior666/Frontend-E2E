import type { Meta, StoryObj } from "@storybook/react";

const Welcome = () => (
  <div style={{ padding: 32, fontFamily: "EB Garamond, serif", color: "#1c140d" }}>
    <h1 style={{ fontFamily: "Cinzel, serif", fontWeight: 600 }}>RPG Workshop — Storybook</h1>
    <p>
      Components land here as they're authored by the design loop. To start a new screen,
      run <code>/design-loop --component &lt;Name&gt; --story &lt;id&gt;</code>.
    </p>
  </div>
);

const meta: Meta<typeof Welcome> = {
  title: "Welcome",
  component: Welcome,
};
export default meta;

export const Default: StoryObj<typeof Welcome> = {};
