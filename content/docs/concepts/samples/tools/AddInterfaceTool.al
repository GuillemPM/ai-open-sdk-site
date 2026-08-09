ToolSet: Codeunit "AIOS Tool Set";
Echo: Codeunit "My Echo Tool";
Request: Record "AIOS Chat Request";
Result: Codeunit "AIOS Generate Result";
begin
    ToolSet.Add(Echo);
    Request.SetPrompt('Use the echo tool when helpful');
    Result := Client.GenerateText(Model, Request, ToolSet, 5);
end;
