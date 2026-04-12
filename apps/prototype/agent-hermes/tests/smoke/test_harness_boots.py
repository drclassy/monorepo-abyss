def test_harness_module_importable():
    """The smoke harness fixture must be importable. Sanity check only."""
    from conftest import wait_for_health
    assert callable(wait_for_health)
