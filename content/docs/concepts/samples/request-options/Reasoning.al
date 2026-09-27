Anthropic: Codeunit "AIOS Anthropic";
Client: Codeunit "AIOS Client";
Request: Record "AIOS Chat Request";
Result: Codeunit "AIOS Generate Result";
ApiKey: SecretText;
begin
    Request.SetPrompt('Which of these three quotes is cheapest after discounts? ...');
    Request.SetReasoning("AIOS Reasoning Effort"::Medium);
    Request.SetMaxTokens(8000);

    Result := Client.GenerateText(Anthropic.Model('claude-fable-5', ApiKey), Request);
end;
