Result := Client.GenerateText(
    Anthropic.Model('claude-fable-5', ApiKey),
    'You are a Business Central assistant.',
    Prompt);
