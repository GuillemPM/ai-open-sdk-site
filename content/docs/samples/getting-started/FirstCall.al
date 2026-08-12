Anthropic: Codeunit "AIOS Anthropic";
Client: Codeunit "AIOS Client";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    // Load into SecretText from Isolated Storage / setup
    Result := Client.GenerateText(
        Anthropic.Model('claude-fable-5', ApiKey),
        'Hello');
    Message(Result.Output());
end;
