Client: Codeunit "AIOS Client";
Request: Record "AIOS Chat Request";
Result: Codeunit "AIOS Generate Result";
begin
    Request.SetSystemMessage('You answer questions about Business Central sales orders.');

    Request.SetPrompt('Order 101005 ships late. Draft a two-line apology to the customer.');
    Result := Client.GenerateText(Model, Request);
    Request.AppendAssistantMessage(Result.Output());

    Request.SetPrompt('Make it more formal and mention the new date, 14 March.');
    Result := Client.GenerateText(Model, Request);
    Request.AppendAssistantMessage(Result.Output());
end;
