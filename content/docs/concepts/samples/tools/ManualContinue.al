ToolSet.Add(Echo);
Request.SetPrompt('Use the echo tool');
Request.SetTools(ToolSet);
Request.EnsureMessagesFromPrompt();

Result := Client.GenerateText(Model, Request);
if Result.HasToolCalls() then begin
    ToolCalls := Result.GetToolCalls();
    Request.AppendAssistantToolCalls(Result.Output(), ToolCalls);
    for i := 1 to ToolCalls.Count() do begin
        ToolCalls.Get(i, Call);
        ToolSet.Execute(Call.GetName(), Call.GetArguments(), ResultText);
        Request.AppendToolResult(Call.GetId(), Call.GetName(), ResultText);
    end;
    Result := Client.GenerateText(Model, Request);
end;
