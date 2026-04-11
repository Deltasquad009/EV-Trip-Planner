# Stitch Skill

This skill enables the agent to utilize Google Stitch (via StitchMCP) for high-fidelity UI design, rapid prototyping, and iterative refinement.

## Usage Guide

To use this skill, follow these principles:

1.  **Vibe Design**: When generating screens, use descriptive prompts that capture the "vibe" (e.g., "sleek dark mode with glassmorphism", "vibrant eco-friendly aesthetic").
2.  **Iterative Refinement**: After generating a screen, use `edit_screens` or `generate_variants` to refine the design based on user feedback.
3.  **Cross-Platform Consistency**: Use the `deviceType` parameter to generate designs for both mobile and desktop.
4.  **Component Extraction**: Use `get_screen` to understand the layout and potentially extract CSS/HTML for implementation.

## Available Actions

- **Project Management**: Create and list projects to organize designs.
- **Screen Generation**: Transform text prompts into high-fidelity UI.
- **Variant Generation**: Explore multiple design directions simultaneously.
- **Screen Editing**: Modify existing screens with natural language.

## Best Practices

- Always start by creating a dedicated project for a new design task.
- Use specific color palettes or typography mentions in prompts for consistency.
- Present generated screen IDs and project IDs to the user so they can view them in the Stitch UI.
