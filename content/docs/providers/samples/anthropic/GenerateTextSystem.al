Result := Client.GenerateText(
    Anthropic.Model('claude-sonnet-4-5', ApiKey),
    'You are a Business Central assistant.',
    Prompt);
