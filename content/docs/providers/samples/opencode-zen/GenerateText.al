Zen: Codeunit "AIOS OpenCode Zen";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Result := Client.GenerateText(
        Zen.Model('your-model-id', ApiKey),
        'You are a Business Central assistant.',
        Prompt);
    Message(Result.Output());
end;
