ToolSet: Codeunit "AIOS Tool Set";
Handler: Codeunit "My App Tools";
Request: Record "AIOS Chat Request";
Result: Codeunit "AIOS Generate Result";
begin
    ToolSet.Use(Handler);
    Request.SetPrompt('What is 2 plus 3?');
    Result := Client.GenerateText(Model, Request, ToolSet, 5);
end;
