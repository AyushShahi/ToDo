package com.project.todo.service;

import com.project.todo.model.Todo;
import com.project.todo.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    public List<Todo> getAllTodos() {
        return todoRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<Todo> getTodoById(Long id) {
        return todoRepository.findById(id);
    }

    public List<Todo> getTodosByStatus(Boolean completed) {
        return todoRepository.findByCompleted(completed);
    }

    public List<Todo> searchTodos(String keyword) {
        return todoRepository.findByTitleContainingIgnoreCase(keyword);
    }

    @Transactional
    public Todo createTodo(Todo todo) {
        return todoRepository.save(todo);
    }

    @Transactional
    public Todo updateTodo(Long id, Todo todoDetails) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));

        todo.setTitle(todoDetails.getTitle());
        todo.setDescription(todoDetails.getDescription());
        todo.setCompleted(todoDetails.getCompleted());

        return todoRepository.save(todo);
    }

    @Transactional
    public Todo toggleComplete(Long id) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));

        todo.setCompleted(!todo.getCompleted());
        return todoRepository.save(todo);
    }

    @Transactional
    public void deleteTodo(Long id) {
        todoRepository.deleteById(id);
    }
}
